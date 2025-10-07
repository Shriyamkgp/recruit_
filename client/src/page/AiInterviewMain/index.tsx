import React, { useState, useCallback } from "react";
import "./interviewlayout.css";
import Dictaphone from "./Dictaphone";
import AgentVoice from "./AgentVoice";
import WebcamCapture from "./webcam";

interface IndexProps {
  jobId: string; // We expect jobId to be a string
}

function index({ jobId }: IndexProps) {
  // State to hold the transcript received from the child
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currIndex, setCurrIndex] = useState(0);

  let agentArray: string[] = [
    "Hello how are you",
    "I hope you are doing well",
    "Hey This is the last message, Thank you for the interview",
  ];

  const interviewComplete = currIndex >= agentArray.length;

  // 1. Function called by the TextToSpeech component when it finishes speaking
  const handleSpeechComplete = useCallback(() => {
    // console.log("TTS sequence finished. Starting Dictaphone.");

    setTimeout(() => {
      // Only proceed if the interview is not yet complete
      if (!interviewComplete) {
        setIsUserTurn(true);
        console.log("-> User turn started (Dictaphone mounted).");
      } else {
        console.log("-> Interview sequence finished.");
      }
    }, 500);
  }, []);

  // Handler for STT (from previous discussion)
  const handleTranscriptChange = useCallback(
    (newTranscript: string, final: boolean) => {
      setTranscript(newTranscript);

      if (final) {
        console.log("User sequence finished. Starting Agent.");
        setIsUserTurn(false);
        setCurrIndex((currIndex) => currIndex + 1);
      }
    },
    []
  );

  return (
    <>
      {!isUserTurn ? (
        <AgentVoice
          text_input={agentArray[currIndex]}
          onSpeechComplete={handleSpeechComplete}
        />
      ) : (
        <>
          <Dictaphone onTranscriptChange={handleTranscriptChange} />
        </>
      )}

      {/* <h1>Starting AI interview for {jobId}</h1> */}
      <div className="interview-container">
        {/* 1. Sidebar for Questions/Answers (Larger Rectangular Block)
         */}
        <div className="sidebar">
          <div className="sidebar-header">Interview Chat</div>
          <div className="chat-area">
            {/* Interview text content goes here */}
            <p>AI: Welcome! Tell me about yourself.</p>
            <p>You: I have 5 years of experience...</p>
            <p>{transcript}</p>
          </div>
        </div>

        {/* 2. Main Content Area for Video/Visualizer*/}
        <div className="main-content">
          {/* Central Audio Visualizer/Circle */}
          <div className="visualizer">
            <div
              className={`visualizer-circle ${
                !isUserTurn ? "is-speaking" : ""
              }`}
            >
              🔊
            </div>
            <div className="visualizer-text">
              {/* You should use state to update this text as well */}
              {!isUserTurn ? "AI is Speaking..." : "Listening for Answer..."}
            </div>
          </div>

          {/* 4. Small User Video Block (Like Google Meets)
           */}
          <div className="user-video-block">
            <div className="video-placeholder">
              <WebcamCapture />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default index;
