import React from "react";
import { useNavigate } from "react-router-dom";

interface AppProp {
  jobId?: string;
}

interface InterviewInstruction {
  id: number;
  title: string; // The bolded phrase or summary of the instruction
  detail: string; // The full explanation of the instruction
}

const INTERVIEW_INSTRUCTIONS: InterviewInstruction[] = [
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
      "Take the time you need to formulate a complete answer. The session will only advance when you explicitly indicate you are finished (e.g., by clicking a 'Submit' or 'Continue' button, if available).",
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

const App: React.FC<AppProp> = ({ jobId = null }) => {
  console.log(jobId);
  const navigate = useNavigate();
  const handlestartinterview = () => {
    localStorage.setItem("startInterview", `${jobId}`);
    navigate(`/main-ai-${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-6 md:p-10">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            AI Interview Candidate Instructions
          </h1>
          <p className="mt-2 text-lg text-orange-500">
            Please read these guidelines before starting your session.
          </p>
        </header>

        <div className="space-y-6">
          {INTERVIEW_INSTRUCTIONS.map((instruction) => (
            <div
              key={instruction.id}
              className="flex items-start p-5 bg-indigo-50 border border-indigo-200 rounded-xl transition duration-300 hover:shadow-md"
            >
              {/* Icon / Numbering */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-xl font-bold rounded-full bg-indigo-500 text-white shadow-lg mr-4">
                {instruction.id}
              </div>

              <div className="flex-grow">
                {/* Title */}
                <h3 className="font-bold text-xl text-indigo-800 mb-1">
                  {instruction.title}
                </h3>

                {/* Detail */}
                <p className="text-gray-700 leading-relaxed">
                  {instruction.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-10 pt-4 border-t text-center">
          <button
            onClick={handlestartinterview}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-150 transform hover:scale-105"
          >
            I Understand, Start Interview
          </button>
        </footer>
      </div>
    </div>
  );
};

export default App;
