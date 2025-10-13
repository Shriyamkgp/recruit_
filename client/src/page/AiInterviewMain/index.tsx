import React, { useState, useCallback, useEffect, useRef } from "react";
import "./interviewlayout.css";
import Dictaphone from "./Dictaphone";
import AgentVoice from "./AgentVoice";
import WebcamCapture from "./webcam";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../../components/webSockerContext";

interface IndexProps {
  jobId: string;
}

function index({ jobId }: IndexProps) {
  const { messages, sendMessage, interviewStarted, isConnected } =
    useWebSocket();
  const navigate = useNavigate();
  const divRef = useRef<HTMLDivElement>(null);

  // State to hold the transcript received from the child
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currIndex, setCurrIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [prevIndex, setPrevIndex] = useState(-1);

  const updateIndex = useCallback(() => {
    setCurrIndex((currIndex) => currIndex + 1);
  }, []);

  // Function to send message to WebSocket
  const handleSendMessage = useCallback(
    async (textToSend: string) => {
      await sendMessage(textToSend, updateIndex);
    },
    [sendMessage]
  );

  useEffect(() => {
    if (divRef.current) {
      // Scroll to the bottom of the referenced div
      divRef.current.scrollTo({
        top: divRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  //End Interview Button Handler
  const endbuttonhandle = () => {
    console.log("End Interview Button Clicked");
    navigate("./../thankyou");
  };

  const interviewComplete =
    messages.filter((message) => message.sender === "ai").length > 10 ||
    (messages[messages.length - 1].sender === "system" &&
      messages[messages.length - 1].text ===
        "Thank you for completing the interview!");

  const handleSpeechComplete = useCallback(() => {
    setTimeout(() => {
      console.log(`AI sequence finished.: ${interviewComplete}`);
      if (!interviewComplete) {
        console.log("-> Starting User turn (Dictaphone mounting).");
        setIsUserTurn(true);
        console.log("-> User turn started (Dictaphone mounted).");
      } else {
        console.log("-> Interview sequence finished.");
      }
    }, 100);
  }, [interviewComplete, setIsUserTurn]);

  // Handler for STT (from previous discussion)
  const handleTranscriptChange = useCallback(
    (newTranscript: string, final: boolean) => {
      setTranscript(newTranscript);

      if (final) {
        setPrevIndex(currIndex);
        console.log("User sequence finished. Starting Agent.");
        handleSendMessage(newTranscript);
        setTranscript("");
        setIsUserTurn(false);
      }
    },
    [interviewComplete]
  );

  useEffect(() => {
    setIsMounted(true);
    console.log("-> App component fully mounted. Initial render complete.");
  }, []);

  let currentTurnComponent;

  if (!isMounted) {
    currentTurnComponent = (
      <div className="visualizer-text text-xl font-bold text-yellow-400">
        Initializing AI Interview...
      </div>
    );
  } else {
    // Find the last message sent by the AI
    let lastAiMessage: { text: string } = { text: "" };
    if (prevIndex !== currIndex && !isUserTurn) {
      const foundMessage = [...messages]
        .reverse()
        .find((msg) => msg.sender === "ai" && typeof msg.text === "string");
      if (foundMessage && foundMessage.text) {
        lastAiMessage.text = foundMessage.text;
      }
    }

    currentTurnComponent = !isUserTurn ? (
      <AgentVoice
        text_input={lastAiMessage.text}
        onSpeechComplete={handleSpeechComplete}
      />
    ) : (
      <Dictaphone onTranscriptChange={handleTranscriptChange} />
    );
  }
  const showEndButton =
    messages.filter((msg) => msg.sender === "ai").length > 10;
  console.log(messages);
  return (
    <>
      {currentTurnComponent}
      {/* <h1>Starting AI interview for {jobId}</h1> */}
      {showEndButton && (
        <button className="end-interview-btn" onClick={endbuttonhandle}>
          End Interview
        </button>
      )}
      <div className="interview-container">
        {/* 1. Sidebar for Questions/Answers (Larger Rectangular Block)
         */}
        <div className="sidebar">
          <div className="sidebar-header">Interview Chat</div>
          <div
            className="chat-area"
            ref={divRef}
            style={{ overflowY: "scroll" }}
          >
            {/* Interview text content goes here */}

            {messages
              .filter((message) => message.sender !== "system")
              .map((message) => {
                if (message.sender === "ai") {
                  return (
                    <p
                      key={message.timestamp.toISOString()}
                      className="ai-message bg-blue-200 text-white"
                    >
                      Agent: {message.text}
                    </p>
                  );
                } else if (
                  message.sender === "user" &&
                  messages
                    .filter((m) => m.sender === "user")
                    .indexOf(message) !== 0
                ) {
                  return (
                    <p
                      key={message.timestamp.toISOString()}
                      className="user-message"
                    >
                      You: {message.text}
                    </p>
                  );
                } else {
                  return null;
                }
              })}
            {transcript}
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
              {!isUserTurn ? "Agent is Speaking..." : "Listening for Answer..."}
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
