import { genAI } from "./AIAgent.ts";

// --- Large Language Model (LLM) Service ---
export const interviewAgentResponse = async (
  transcript: string,
  conversationHistory: Array<{ speaker: string; text: string }>,
  context: {
    jobDescription: string;
    candidateResume: string;
    questionsAsked: number;
  }
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const history = conversationHistory.map((turn) => ({
      role: turn.speaker === "AI" ? "model" : "user",
      parts: [{ text: turn.text }],
    }));

    const chat = model.startChat({ history });

    const prompt = buildInterviewPrompt(transcript, context);
    const result = await chat.sendMessageStream(prompt);

    return result.stream;
  } catch (error) {
    console.error("LLM generation error:", error);
    throw error;
  }
};

const buildInterviewPrompt = (
  transcript: string,
  context: {
    jobDescription: string;
    candidateResume: string;
    questionsAsked: number;
  }
) => {
  const { jobDescription, candidateResume, questionsAsked } = context;

  if (questionsAsked === 0) {
    return `
You are an expert technical interviewer conducting a professional job interview. Your persona is professional, engaging, and supportive.

CONTEXT:
Job Description: ${jobDescription}
Candidate Resume: ${candidateResume}

INTERVIEW STRUCTURE (11 questions total):
- Question 1: Introduction & role understanding
- Questions 2-8: Technical & experience-based questions
- Question 9: Behavioral question
- Question 10: "Any questions for us?"
- Question 11: Closing remarks

You are starting the interview. Begin with a warm welcome and ask the first question about their understanding of the role and why they're interested in this position.

Keep your response concise and natural. Ask only ONE question at a time.
`;
  }

  if (questionsAsked >= 10) {
    return `
The interview is complete. Thank the candidate professionally and let them know about next steps. 
Keep it brief and positive. End with something like "Thank you for your time today. We'll be in touch soon with next steps."
`;
  }

  let questionType = "";
  if (questionsAsked <= 8) {
    questionType =
      questionsAsked === 8
        ? "Ask a behavioral question about teamwork, problem-solving, or handling challenges."
        : "Ask a technical or experience-based question related to their background and the job requirements.";
  } else if (questionsAsked === 9) {
    questionType =
      "Ask if they have any questions about the role, company, or team.";
  } else {
    questionType = "Provide closing remarks and thank them for their time.";
  }

  return `
You are conducting a professional job interview. The candidate just responded: "${transcript}"

CONTEXT:
Job Description: ${jobDescription}
Candidate Resume: ${candidateResume}
Current Question Number: ${questionsAsked + 1} of 11

INSTRUCTIONS:
${questionType}

Provide a brief acknowledgment of their response (if appropriate) and ask your next question.
Keep it conversational and professional. If they seem stuck, offer gentle hints.
Ask only ONE question at a time.
`;
};
