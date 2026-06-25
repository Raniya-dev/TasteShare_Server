import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const chatBot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a cooking assistant.
      
Answer cooking questions clearly and concisely.

Question: ${message}`,
    });

    res.status(200).json({
      reply: response.text,
    });

  } catch (error) {
    console.error("CHATBOT ERROR:", error);

    res.status(500).json({
      message: "Failed to generate response",
    });
  }
};