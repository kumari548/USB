import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const getCyberAssistantResponse = async (prompt: string, scanContext?: any) => {
  try {
    const model = "gemini-3-flash-preview";
    const systemInstruction = `You are "TrustGuard AI", a specialized cybersecurity assistant for USB hardware security. 
    Your goal is to explain USB scan results, identify potential threats like BadUSB or Rubber Ducky, and provide actionable security advice.
    Be technical, professional, and concise. Use markdown for formatting.
    ${scanContext ? `Current Scan Context: ${JSON.stringify(scanContext)}` : ''}`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error: Unable to reach the AI assistant. Please check your connection.";
  }
};
