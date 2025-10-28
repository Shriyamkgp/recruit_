import React from "react";
import { useNavigate } from "react-router-dom";

import { useWebSocket } from "../components/WebSocketContext.tsx";
import { INTERVIEW_INSTRUCTIONS } from "../components/InterviewInstructions.tsx";

import "../styles/AIInterview.css";

import * as RecruitApi from "@/api/RecruitApi.js";

const AIIntroductionPage = () => {
  const navigate = useNavigate();

  // Get applicationId from session storage
  const applicationId = sessionStorage.getItem("applicationId");

  // Destructure WebSocket functions
  const {
    startInterview: wsStartInterview,
    isConnected,
    addMessage,
  } = useWebSocket();

  // --- Effects ---

  React.useEffect(() => {
    // Ensure we have an ID before attempting to start the process
    if (!applicationId) {
      console.error("Application ID not found in session storage.");
      return;
    }

    const apiCall = async () => {
      try {
        // Call the API to officially mark the application status as 'interview started'
        const response = await RecruitApi.startInterview(applicationId);
        console.log("Interview initiation response:", response);

        // We can optionally display the job title here if returned by the API
      } catch (error) {
        
        console.error("Error starting interview via API:", error);
        addMessage(
          "system",
          "❌ Failed to initiate interview. Please try again."
        );
      }
    };
    apiCall();
  }, [applicationId, addMessage]); // Depend on applicationId and addMessage

  // --- Handlers ---

  const handleStartInterview = () => {
    if (!applicationId) {
      addMessage(
        "system",
        "❌ Application ID missing. Cannot start interview."
      );
      return;
    }

    if (!isConnected) {
      addMessage("system", "❌ Connection not ready. Please wait a moment.");
      return;
    }

    // Start WebSocket conversation (e.g., sends an initial message to the server)
    wsStartInterview(applicationId);

    // Store interview status locally (e.g., to indicate an active session)
    localStorage.setItem("startInterview", applicationId);

    // Navigate to the main chat interface
    navigate(`/main-ai/${applicationId}`);
  };

  // --- Render ---
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

        {/* Instructions list (assuming INTERVIEW_INSTRUCTIONS is an array of objects) */}
        <div className="space-y-6">
          {INTERVIEW_INSTRUCTIONS.map(
            (instruction: { id: number; title: string; detail: string }) => (
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
            )
          )}
        </div>

        {/* Start Button Footer */}
        <footer className="mt-10 pt-4 border-t text-center">
          <button
            onClick={handleStartInterview}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-150 transform hover:scale-105"
            // Disable button if not connected to WebSocket
            disabled={!isConnected}
          >
            I Understand, Start Interview
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AIIntroductionPage;
