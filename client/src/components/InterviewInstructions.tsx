interface InterviewInstruction {
  id: number;
  title: string;
  detail: string;
}

export const INTERVIEW_INSTRUCTIONS: InterviewInstruction[] = [
  {
    id: 1,
    title: "Treat the AI as a Real Interviewer",
    detail:
      "Answer all questions thoroughly and professionally, just as you would in a live interview. Avoid one-word answers and casual language.",
  },
  {
    id: 2,
    title: "Be Specific and Elaborate",
    detail:
      "When answering a technical question, don't just state the concept—provide concrete examples from your past projects or roles to demonstrate your understanding.",
  },
  {
    id: 3,
    title: "Focus on the Current Question",
    detail:
      "The AI is programmed to handle the interview flow step-by-step. Do not jump ahead or address future topics. Wait for the AI's feedback or next prompt.",
  },
  {
    id: 4,
    title: "No Time Constraint",
    detail:
      "Take the time you need to formulate a complete answer. The session will only advance when you explicitly indicate you are finished.",
  },
  {
    id: 5,
    title: "Clarification is Welcome",
    detail:
      "If the AI's question is unclear, feel free to ask a clarifying question (e.g., 'Could you rephrase that question regarding the specific technology?').",
  },
  {
    id: 6,
    title: "Display Your Code Thinking",
    detail:
      "For complex questions, walk the interviewer through your thought process, discussing trade-offs, alternative solutions, and why you chose your final approach.",
  },
];
