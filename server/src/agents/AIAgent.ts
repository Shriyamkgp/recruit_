import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// --- Initialize AI Clients ---
export const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || ""
);
