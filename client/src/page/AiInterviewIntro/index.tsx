import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../../components/webSockerContext";
import { INTERVIEW_INSTRUCTIONS } from "./interviewInstructions";

interface AppProp {
  jobId?: string;
}

interface Message {
  sender: "user" | "ai" | "system";
  text: string;
  timestamp: Date;
}

const App: React.FC<AppProp> = ({ jobId = null }) => {
  console.log(jobId);
  const navigate = useNavigate();

  const { startInterview, isConnected, addMessage } = useWebSocket();

  const handlestartinterview = () => {
    const interviewId = "68e8ee3e8c4e5c1ab2c2e9fc";
    if (!isConnected) {
      addMessage("system", "❌ Connection not ready. Please wait a moment.");
      return;
    }
    startInterview(interviewId);
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
