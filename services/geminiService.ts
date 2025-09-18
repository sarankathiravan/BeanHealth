import { GoogleGenerativeAI } from "@google/generative-ai";
import { MedicalRecord } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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

export const analyzeMedicalRecord = async (
  file: File
): Promise<MedicalRecord> => {
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

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const imagePart = await fileToGenerativePart(file);

    const prompt = `Analyze this medical record image and extract key information. 

IMPORTANT: You must respond with ONLY a valid JSON object in this exact format:
{
  "date": "YYYY-MM-DD",
  "type": "document type",
  "summary": "brief summary",
  "doctor": "doctor name"
}

Instructions:
- date: Extract the date from the document in YYYY-MM-DD format. If no date found, use today's date.
- type: Identify the document type (e.g., "Lab Report", "Doctor's Note", "Prescription", "X-Ray Report", "Blood Test")
- summary: Write a brief 1-2 sentence summary of the key findings or information
- doctor: Extract the doctor's name. If not found, use "Unknown"

Do not include any text before or after the JSON object. Respond with only the JSON.`;

    console.log("Sending request to Gemini AI...");
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim();

    console.log("Raw AI response:", text);

    // Try to extract JSON from the response
    let parsedResult;
    try {
      // First, try to parse the response directly as JSON
      parsedResult = JSON.parse(text);
    } catch (parseError) {
      console.warn(
        "Direct JSON parsing failed, trying to extract JSON from text:",
        text
      );

      // Try to find JSON within the text using regex
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResult = JSON.parse(jsonMatch[0]);
          console.log("Successfully extracted JSON from text:", parsedResult);
        } catch (extractError) {
          console.warn("Failed to parse extracted JSON:", extractError);
          parsedResult = null;
        }
      } else {
        console.warn("No JSON found in response");
        parsedResult = null;
      }
    }

    // If we still don't have valid JSON, create a fallback based on the text
    if (!parsedResult) {
      console.log("Creating fallback analysis from text response");
      parsedResult = {
        date: new Date().toISOString().split("T")[0],
        type: "Medical Document",
        summary:
          text.length > 0
            ? `AI analysis: ${text.substring(0, 100)}${
                text.length > 100 ? "..." : ""
              }`
            : "Medical document uploaded and processed",
        doctor: "Unknown",
      };
    }

    // Validate and clean the parsed result
    const cleanResult = {
      id: `rec-${Date.now()}`,
      date: parsedResult.date || new Date().toISOString().split("T")[0],
      type: parsedResult.type || "Medical Document",
      summary: parsedResult.summary || "Medical record analyzed",
      doctor: parsedResult.doctor || "Unknown",
      category: "General",
    };

    console.log("Final analysis result:", cleanResult);
    return cleanResult;
  } catch (error) {
    console.error("Error analyzing medical record:", error);
    throw new Error(
      "Failed to analyze medical record. Please check the console for details."
    );
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
      model: "gemini-1.5-flash",
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
      model: "gemini-1.5-flash",
      systemInstruction: `You are an expert medical summarization AI. Your purpose is to synthesize medical record summaries into a clear, concise, and objective health overview for a patient.
Rules:
1. Focus on identifying key trends, significant changes, and important results.
2. Use neutral, easy-to-understand language. Avoid overly technical jargon.
3. **Crucially, you must NOT provide any medical advice, diagnosis, or treatment recommendations.**
4. Do not make predictions about future health outcomes.
5. Structure the output as a single, cohesive paragraph. Synthesize information, do not list records one by one.
6. Keep the summary to 2-3 sentences maximum.`,
    });

    const prompt = `Please create a brief health summary based on these medical records:

${records.map((r) => `• ${r.date} (${r.type}): ${r.summary}`).join("\n")}

Write a 2-3 sentence summary that gives the patient an overview of their recent health status. Focus on the most important findings and trends. Do not provide medical advice.`;

    console.log("Generating health summary for", records.length, "records...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summaryText = response.text().trim();

    console.log("Generated health summary:", summaryText);

    // Validate the summary
    if (!summaryText || summaryText.length < 10) {
      return `Based on your ${records.length} medical record${
        records.length > 1 ? "s" : ""
      }, your recent health information has been documented and is available for review.`;
    }

    return summaryText;
  } catch (error) {
    console.error("Error summarizing records:", error);

    // Provide a fallback summary
    const recordCount = records.length;
    const latestRecord = records[0]; // Records are sorted by date desc

    if (recordCount === 0) {
      return "No medical records available to summarize.";
    } else if (recordCount === 1) {
      return `Your most recent medical record from ${latestRecord.date} (${latestRecord.type}) has been documented: ${latestRecord.summary}`;
    } else {
      return `You have ${recordCount} medical records on file. Your most recent entry from ${latestRecord.date} shows: ${latestRecord.summary}`;
    }
  }
};
