// Express example (simplified)
import express from "express";
import { Request, Response } from "express";
const router = express.Router();
import { AI_Interviewer } from "../controllers/InterviewControl.ts";
// Your existing logic

// Middleware
// app.use(cors());
// app.use(bodyParser.json());

// 1. Start Interview Endpoint
router.post("/start", (req: Request, res: Response) => {
  // 1. Create a unique session ID
  const sessionId = 1;
  // 2. Initialize your AI agent for this session
  const firstQuestion = AI_Interviewer.start(sessionId, req.body.jobRole);

  res.status(200).json({ sessionId, message: firstQuestion });
});

// 2. Chat Endpoint
router.post("/chat", async (req: Request, res: Response) => {
  const { sessionId, message } = req.body;

  try {
    // 1. Get the AI's response from your core logic
    const { aiResponse, isComplete } = await AI_Interviewer.processAgent(
      sessionId,
      message
    );
    // 2. Send back the response
    res.status(200).json({ aiResponse, isInterviewComplete: isComplete });
  } catch (error) {
    res.status(500).json({ error: "Failed to process message." });
  }
});

export default router;
