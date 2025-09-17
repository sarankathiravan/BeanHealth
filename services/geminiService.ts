// FIX: Using correct import for GoogleGenAI
import { GoogleGenAI, Type, Part, Content } from "@google/genai";
import { MedicalRecord } from '../types';

// FIX: Correctly instantiate GoogleGenAI with environment variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({apiKey});

// FIX: Use recommended model 'gemini-2.5-flash'
const model = 'gemini-2.5-flash';

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
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


export const analyzeMedicalRecord = async (file: File): Promise<MedicalRecord> => {
  const imagePart = await fileToGenerativePart(file);

  const request = {
    model: model,
    contents: {
        parts: [
            imagePart,
            { text: "Analyze this medical record. Extract the date, record type (e.g., 'Lab Report', 'Doctor's Note'), the attending doctor's name, and provide a concise one-sentence summary. Return the result as a JSON object." }
        ],
    },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                date: { type: Type.STRING, description: 'The date of the record in YYYY-MM-DD format.' },
                type: { type: Type.STRING, description: 'The type of medical record.' },
                summary: { type: Type.STRING, description: 'A one-sentence summary of the record.' },
                doctor: { type: Type.STRING, description: "The doctor's name." },
            },
            required: ['date', 'type', 'summary', 'doctor'],
        }
    }
  };

  try {
    const result = await ai.models.generateContent(request);
    // FIX: Access text directly from the response object
    const text = result.text;
    const parsedResult = JSON.parse(text);

    return {
      id: `rec-${Date.now()}`,
      ...parsedResult,
    };
  } catch (error) {
    console.error("Error analyzing medical record:", error);
    throw new Error("Failed to analyze medical record. Please check the console for details.");
  }
};


export const getChatResponse = async (history: Content[], newMessage: string): Promise<string> => {
    const chat = ai.chats.create({
        model: model,
        history: history,
        config: {
            systemInstruction: "You are a helpful medical assistant for Beanhealth. Your role is to answer user questions about their health data in a clear, concise, and friendly manner. Do not provide medical advice. If asked for medical advice, direct the user to consult with their doctor.",
        }
    });

    const result = await chat.sendMessage({ message: newMessage });
    // FIX: Access text directly from the response object
    return result.text;
};

export const summarizeAllRecords = async (records: MedicalRecord[]): Promise<string> => {
  if (records.length === 0) {
    return "No records available to summarize.";
  }

  // This is the "few-shot" prompt where we provide examples to train the model in-context.
  const examplesPrompt = `
Here are some examples of how to summarize medical records:

**Example 1:**
*   **Records:**
    *   2024-07-10 (Lab Report): CBC results are normal.
    *   2024-07-12 (Doctor's Note): Patient reports feeling well. Blood pressure is stable at 130/85 mmHg.
*   **Summary:**
    Recent check-ups indicate that your health is stable. Your latest lab results were normal, and your blood pressure remains well-managed. Keep up the great work with your treatment plan.

**Example 2:**
*   **Records:**
    *   2024-06-15 (Lab Report): A1c level is slightly elevated at 6.8%.
    *   2024-06-20 (Doctor's Note): Discussed diet and exercise to manage A1c levels. Recommended follow-up in 3 months.
*   **Summary:**
    Your recent lab work showed a slight elevation in your A1c levels. Your doctor has discussed managing this with diet and exercise and will follow up with you to monitor your progress.

---

**Actual Records to Summarize:**
*   **Records:**
    ${records.map(r => `- ${r.date} (${r.type}): ${r.summary}`).join('\n')}
*   **Summary:**
  `;

  // This is the system instruction to curate the model's behavior.
  const systemInstruction = `You are an expert medical summarization AI. Your purpose is to synthesize medical record summaries into a clear, concise, and objective health overview for a patient.
Rules:
1. Focus on identifying key trends, significant changes, and important results.
2. Use neutral, easy-to-understand language. Avoid overly technical jargon.
3. **Crucially, you must NOT provide any medical advice, diagnosis, or treatment recommendations.**
4. Do not make predictions about future health outcomes.
5. Structure the output as a single, cohesive paragraph. Synthesize information, do not list records one by one.`;
  
  try {
    const result = await ai.models.generateContent({
        model: model,
        contents: examplesPrompt,
        config: {
          systemInstruction: systemInstruction,
        }
    });
    // FIX: Access text directly from the response object
    return result.text;
  } catch (error) {
    console.error("Error summarizing records:", error);
    throw new Error("Failed to generate health summary.");
  }
};
