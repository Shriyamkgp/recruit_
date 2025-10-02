import * as dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not defined.");
  throw new Error("GEMINI_API_KEY environment variable is missing.");
}

const ai = new GoogleGenAI({ apiKey });

export async function textSummaryAgent(prompt?: string) {
  if (!prompt) {
    prompt = "Just say 'No Prompt Provided'";
  }
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
  });
  console.log(response.text);
}

export default textSummaryAgent;
