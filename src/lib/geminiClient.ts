import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI SDK
// It automatically picks up the GEMINI_API_KEY environment variable.
const ai = new GoogleGenAI({});

export async function queryGemini(prompt: string, modelName: string = 'gemini-3.6-flash'): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    
    return response.text || null;
  } catch (error) {
    console.error("Gemini generation failed:", error);
    return null;
  }
}
