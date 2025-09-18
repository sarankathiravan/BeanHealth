import { GoogleGenerativeAI } from "@google/generative-ai";
import { MedicalRecord } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Simple cache to avoid re-analyzing identical files
const analysisCache = new Map<string, MedicalRecordWithVitals>();



// Generate a simple hash for file content (for caching)
const generateFileHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, 16);
};

// Create intelligent fallback analysis when quota is exceeded
const createFallbackAnalysis = (file: File): MedicalRecordWithVitals => {
  const fileName = file.name.toLowerCase();
  const today = new Date().toISOString().split("T")[0];

  // Smart type detection based on filename
  let type = "Medical Document";
  if (fileName.includes("lab") || fileName.includes("blood"))
    type = "Lab Report";
  else if (fileName.includes("prescription") || fileName.includes("rx"))
    type = "Prescription";
  else if (fileName.includes("xray") || fileName.includes("x-ray"))
    type = "X-Ray Report";
  else if (fileName.includes("doctor") || fileName.includes("note"))
    type = "Doctor's Note";

  return {
    id: `rec-${Date.now()}`,
    date: today,
    type,
    summary: `${type} uploaded successfully. AI analysis temporarily unavailable - please review the document manually for detailed information.`,
    doctor: "Unknown",
    category: "General"
    // No extractedVitals - only provide when AI actually extracts them
  };
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result.split(",")[1]);
      } else {
        reject(new Error("Failed to read file as base64 string."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

// Interface for extracted vital signs
export interface ExtractedVitals {
  bloodPressure?: { systolic: number; diastolic: number };
  heartRate?: number;
  temperature?: { value: number; unit: "F" | "C" };
  glucose?: number;
  date: string;
}



// Enhanced interface that includes both analysis and vitals
export interface MedicalRecordWithVitals extends MedicalRecord {
  extractedVitals?: ExtractedVitals;
}

export const analyzeMedicalRecord = async (
  file: File
): Promise<MedicalRecordWithVitals> => {
  if (!genAI) {
    // Return a default medical record if API key is not available
    return {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      type: "Medical Document",
      summary:
        "Document uploaded (AI analysis unavailable - no API key configured)",
      doctor: "Unknown",
      category: "General",
    };
  }

  // Check cache first to save API quota
  try {
    const fileHash = await generateFileHash(file);
    const cacheKey = `${file.name}-${file.size}-${fileHash}`;

    if (analysisCache.has(cacheKey)) {
      console.log("💾 Using cached analysis result (quota saved!)");
      const cached = analysisCache.get(cacheKey)!;
      return {
        ...cached,
        id: `rec-${Date.now()}`, // Generate new ID for each upload
      };
    }


  } catch (error) {
    // Continue with analysis if cache check fails
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1, // Lower temperature for more consistent results
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });


    const imagePart = await fileToGenerativePart(file);

    const prompt = `You are a medical document analysis AI. Analyze this medical record and extract ALL key information including vital signs.

CRITICAL: Respond with ONLY valid JSON in this exact format:
{
  "date": "YYYY-MM-DD",
  "type": "document type",
  "summary": "brief summary",
  "doctor": "doctor name",
  "vitals": {
    "bloodPressure": {"systolic": 120, "diastolic": 80},
    "heartRate": 72,
    "temperature": {"value": 98.6, "unit": "F"},
    "glucose": 95
  }
}

EXTRACTION RULES:
- date: Look for any date on the document (visit date, report date, etc.). Format as YYYY-MM-DD. If no date found, use today's date.
- type: Identify document type from these categories: "Lab Report", "Blood Test", "Prescription", "X-Ray Report", "MRI Report", "CT Scan", "Doctor's Note", "Discharge Summary", "Vaccination Record", "Medical Image", "Test Results", or "Medical Document"
- summary: Write 1-2 sentences describing the key medical findings, test results, or purpose. Be specific about values, conditions, or medications mentioned.
- doctor: Extract doctor's name, clinic name, or medical facility. If not found, use "Unknown"
- vitals: Extract vital signs if found:
  * bloodPressure: Look for "120/80", "BP: 130/85", etc.
  * heartRate: Look for "72 bpm", "HR: 80", "Pulse 75", etc.
  * temperature: Look for "98.6°F", "37°C", "Temp: 99.1", etc.
  * glucose: Look for "95 mg/dL", "Glucose: 110", etc.
  * Only include vitals fields if actual measurements are found

IMPORTANT: Return ONLY the JSON object. No additional text, explanations, or formatting.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text().trim();

    // Enhanced JSON parsing with multiple fallback strategies
    let parsedResult: any = null;

    // Strategy 1: Direct JSON parsing
    try {
      parsedResult = JSON.parse(text);
    } catch (parseError) {
      console.log("Direct JSON parsing failed, trying extraction methods...");

      // Strategy 2: Extract JSON from code blocks
      const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        try {
          parsedResult = JSON.parse(codeBlockMatch[1]);
          console.log("Successfully extracted JSON from code block");
        } catch (e) {
          console.log("Code block extraction failed");
        }
      }

      // Strategy 3: Find JSON object in text
      if (!parsedResult) {
        const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
        if (jsonMatch) {
          try {
            parsedResult = JSON.parse(jsonMatch[0]);
            console.log("Successfully extracted JSON from text");
          } catch (e) {
            console.log("Text extraction failed");
          }
        }
      }

      // Strategy 4: Try to fix common JSON issues
      if (!parsedResult && text.includes("{") && text.includes("}")) {
        try {
          let fixedText = text
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/(\w+):/g, '"$1":') // Add quotes around keys
            .replace(/,\s*}/g, "}") // Remove trailing commas
            .replace(/,\s*]/g, "]"); // Remove trailing commas in arrays

          const jsonMatch = fixedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
            console.log("Successfully parsed fixed JSON");
          }
        } catch (e) {
          console.log("JSON fixing failed");
        }
      }
    }

    // If all parsing strategies failed, create intelligent fallback
    if (!parsedResult) {
      console.log(
        "All JSON parsing strategies failed, creating intelligent fallback"
      );

      // Try to extract information from the text response
      const dateMatch =
        text.match(/\b(\d{4}[-/]\d{1,2}[-/]\d{1,2})\b/) ||
        text.match(/\b(\d{1,2}[-/]\d{1,2}[-/]\d{4})\b/);
      const doctorMatch =
        text.match(/(?:dr\.?|doctor)\s+([a-z\s]+)/i) ||
        text.match(/([a-z]+,?\s+[a-z]+)\s+(?:md|m\.d\.)/i);

      let extractedDate = new Date().toISOString().split("T")[0];
      if (dateMatch) {
        try {
          const date = new Date(dateMatch[1]);
          if (!isNaN(date.getTime())) {
            extractedDate = date.toISOString().split("T")[0];
          }
        } catch (e) {
          console.log("Date extraction failed");
        }
      }

      parsedResult = {
        date: extractedDate,
        type: "Medical Document",
        summary:
          text.length > 0 && text.length < 500
            ? text.replace(/[{}"\[\]]/g, "").trim()
            : "Medical document analyzed - please review the uploaded file for details",
        doctor: doctorMatch ? doctorMatch[1].trim() : "Unknown",
      };
    }

    // Validate and clean the parsed result
    const cleanResult: MedicalRecordWithVitals = {
      id: `rec-${Date.now()}`,
      date: parsedResult.date || new Date().toISOString().split("T")[0],
      type: parsedResult.type || "Medical Document",
      summary: parsedResult.summary || "Medical record analyzed",
      doctor: parsedResult.doctor || "Unknown",
      category: "General",
    };

    // Extract vitals if present
    if (parsedResult.vitals) {
      const vitals = parsedResult.vitals;
      const hasVitals =
        vitals.bloodPressure ||
        vitals.heartRate ||
        vitals.temperature ||
        vitals.glucose;

      if (hasVitals) {
        cleanResult.extractedVitals = {
          ...vitals,
          date: cleanResult.date,
        };
        console.log(
          "✅ Vitals extracted from combined analysis:",
          cleanResult.extractedVitals
        );
      }
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanResult.date)) {
      cleanResult.date = new Date().toISOString().split("T")[0];
    }

    console.log("Final analysis result:", cleanResult);

    // Cache the result to save future API calls
    try {
      const fileHash = await generateFileHash(file);
      const cacheKey = `${file.name}-${file.size}-${fileHash}`;
      analysisCache.set(cacheKey, cleanResult);
      console.log("💾 Analysis result cached for future use");

      // Limit cache size to prevent memory issues
      if (analysisCache.size > 50) {
        const firstKey = analysisCache.keys().next().value;
        analysisCache.delete(firstKey);
      }
    } catch (error) {
      console.log("⚠️ Failed to cache result");
    }

    return cleanResult;
  } catch (error) {
    console.error("Error analyzing medical record:", error);

    // If it's a quota error, use intelligent fallback
    if (error instanceof Error && error.message.includes("429")) {
      return createFallbackAnalysis(file);
    }

    // Return a basic record instead of throwing error to prevent upload failure
    return {
      id: `rec-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: "Medical Document",
      summary:
        "Document uploaded successfully. AI analysis encountered an issue - please review the file manually.",
      doctor: "Unknown",
      category: "General",
    };
  }
};

export const getChatResponse = async (
  history: any[],
  newMessage: string
): Promise<string> => {
  if (!genAI) {
    return "AI chat is currently unavailable. Please check your configuration.";
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction:
        "You are a helpful medical assistant for Beanhealth. Your role is to answer user questions about their health data in a clear, concise, and friendly manner. Do not provide medical advice. If asked for medical advice, direct the user to consult with their doctor.",
    });

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(newMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting chat response:", error);
    return "I'm sorry, I'm having trouble responding right now. Please try again later.";
  }
};

// Test function to check AI connectivity and response format
export const testAIConnection = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  if (!genAI) {
    return {
      success: false,
      message: "Gemini AI not configured - missing API key",
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(
      'Respond with exactly this JSON: {"test": "success", "message": "AI is working"}'
    );
    const response = await result.response;
    const text = response.text().trim();

    console.log("AI test response:", text);

    try {
      const parsed = JSON.parse(text);
      if (parsed.test === "success") {
        return {
          success: true,
          message: "AI connection successful and responding correctly",
        };
      }
    } catch (parseError) {
      // AI responded but not in JSON format
      return {
        success: false,
        message: `AI responded but not in expected format: ${text.substring(
          0,
          100
        )}`,
      };
    }

    return {
      success: false,
      message: "AI responded but test failed",
    };
  } catch (error) {
    return {
      success: false,
      message: `AI connection failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

export const summarizeAllRecords = async (
  records: MedicalRecord[]
): Promise<string> => {
  if (!genAI) {
    return "AI summary is currently unavailable. Please check your configuration.";
  }

  if (records.length === 0) {
    return "No records available to summarize.";
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3, // Slightly higher for more natural language
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 512, // Limit output for faster response
      },
      systemInstruction: `You are an expert medical summarization AI. Create clear, concise health overviews for patients.

RULES:
1. Focus on key trends, significant changes, and important results
2. Use simple, patient-friendly language - avoid medical jargon
3. NEVER provide medical advice, diagnosis, or treatment recommendations
4. Do not make predictions about future health outcomes
5. Write 2-3 sentences maximum as a cohesive summary
6. Synthesize information - don't list records individually
7. Highlight the most recent and significant findings`,
    });

    // Sort records by date (most recent first) and limit to most recent 10 for performance
    const sortedRecords = records
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const prompt = `Summarize these medical records for the patient:

${sortedRecords
  .map((r, index) => `${index + 1}. ${r.date} - ${r.type}: ${r.summary}`)
  .join("\n")}

Create a 2-3 sentence health overview focusing on the most important findings and recent trends. Use simple language the patient can understand.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const summaryText = response.text().trim();

    // Validate and clean the summary
    if (!summaryText || summaryText.length < 10) {
      return generateFallbackSummary(records);
    }

    // Remove any potential medical advice language
    const cleanedSummary = summaryText
      .replace(/\b(should|must|need to|recommend|suggest|advise)\b/gi, "")
      .replace(/\bconsult.*?doctor\b/gi, "")
      .trim();

    return cleanedSummary || generateFallbackSummary(records);
  } catch (error) {
    console.error("Error summarizing records:", error);
    return generateFallbackSummary(records);
  }
};

// Helper function to generate fallback summary
const generateFallbackSummary = (records: MedicalRecord[]): string => {
  const recordCount = records.length;

  if (recordCount === 0) {
    return "No medical records available to summarize.";
  }

  // Sort by date to get the most recent
  const sortedRecords = records.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latestRecord = sortedRecords[0];
  const recordTypes = [...new Set(records.map((r) => r.type))];

  if (recordCount === 1) {
    return `Your medical record from ${new Date(
      latestRecord.date
    ).toLocaleDateString()} (${latestRecord.type}) has been documented: ${
      latestRecord.summary
    }`;
  } else {
    const typesList = recordTypes.slice(0, 3).join(", ");
    return `You have ${recordCount} medical records including ${typesList}. Your most recent entry from ${new Date(
      latestRecord.date
    ).toLocaleDateString()} shows: ${latestRecord.summary}`;
  }
};
