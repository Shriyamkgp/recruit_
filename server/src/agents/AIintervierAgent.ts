// server/src/index.ts (or main entry file)
import * as dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();

// The API key is now accessible via process.env
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not defined.");
  process.exit(1); // Exit if the key is missing
}

// Use the key to initialize your API client

import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({ apiKey });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response);
}

main();
