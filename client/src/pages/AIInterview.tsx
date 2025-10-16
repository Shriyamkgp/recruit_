import React, { useState, useCallback, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";

import { useWebSocket } from "../components/WebSocketContext";

import Dictaphone from "../components/Dictaphone";

import AgentVoice from "../components/AgentVoice";

import { WebCameraCapture } from "../components/WebCamera";

import "../styles/AIInterview.css";

const AIInterview = () => {
  const navigate = useNavigate();

  const { messages, sendMessage, isConnected } = useWebSocket();

  const chatAreaRef = useRef<HTMLDivElement>(null);


  const [isUserTurn, setIsUserTurn] = useState(false);

  const [transcript, setTranscript] = useState("");

  const [currIndex, setCurrIndex] = useState(0);

  const [isMounted, setIsMounted] = useState(false);

  const [prevIndex, setPrevIndex] = useState(-1);

  // --- Effects ---

  // Auto-scroll chat to the bottom on new message

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight,

        behavior: "smooth",
      });
    }
  }, [messages]);

  // Initial mount check

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- Utility Callbacks ---

  const updateIndex = useCallback(() => {
    setCurrIndex((prevIndex) => prevIndex + 1);
  }, []);

  // Function to send user's final transcript to the WebSocket

  const handleSendMessage = useCallback(
    async (textToSend: string) => {
      await sendMessage(textToSend, updateIndex);
    },

    [sendMessage, updateIndex]
  );

  // --- Turn Management Logic ---

  // Interview completion check (e.g., > 10 questions or final message)

  const interviewComplete =
    messages.filter((message) => message.sender === "ai").length > 10 ||
    (messages.length > 0 &&
      messages[messages.length - 1].sender === "system" &&
      messages[messages.length - 1].text ===
        "Thank you for completing the interview!");

  // Called when AI finishes speaking, switches turn to user

  const handleSpeechComplete = useCallback(() => {
    setTimeout(() => {
      if (!interviewComplete) {
        setIsUserTurn(true);
      }
    }, 100);
  }, [interviewComplete]);

  // Handler for Speech-to-Text (STT) changes and final submission

  const handleTranscriptChange = useCallback(
    (newTranscript: string, isFinal: boolean) => {
      setTranscript(newTranscript);

      if (isFinal) {
        setPrevIndex(currIndex);

        handleSendMessage(newTranscript);

        setTranscript("");

        setIsUserTurn(false);
      }
    },

    [currIndex, handleSendMessage]
  );

  // End Interview Button Handler

  const endButtonHandle = () => {
    navigate("./../thankyou");
  };

  // --- Component Rendering Decision ---

  const showEndButton =
    messages.filter((msg) => msg.sender === "ai").length > 10;

  let currentTurnComponent;

  let lastAiMessageText = "";

  if (!isMounted) {
    currentTurnComponent = (
      <div className="visualizer-text text-xl font-bold text-yellow-400">
        Initializing AI Interview...
      </div>
    );
  } else {
    // Get the latest AI message for TTS if it's the AI's turn

    if (!isUserTurn) {
      const foundMessage = [...messages]

        .reverse()

        .find((msg) => msg.sender === "ai" && typeof msg.text === "string");

      if (foundMessage && foundMessage.text) {
        lastAiMessageText = foundMessage.text;
      }
    }

    currentTurnComponent = !isUserTurn ? (
      <AgentVoice
        text_input={lastAiMessageText}
        onSpeechComplete={handleSpeechComplete}
      />
    ) : (
      <Dictaphone onTranscriptChange={handleTranscriptChange} />
    );
  }

  // --- Render ---

  return (
    <>
      {currentTurnComponent}

      {showEndButton && (
        <button className="end-interview-btn" onClick={endButtonHandle}>
          End Interview
        </button>
      )}

      <div className="interview-container">
        {/* 1. Sidebar: Interview Chat Log */}

        <div className="sidebar">
          <div className="sidebar-header">Interview Chat</div>

          <div
            className="chat-area"
            ref={chatAreaRef}
            style={{ overflowY: "scroll" }}
          >
            {messages

              .filter((message) => message.sender !== "system")

              .map((message, index) => {
                const isAi = message.sender === "ai";
                if (index === 0) {
                  return null; // Skip rendering the first item found after filtering
                } else {
                  return (
                    <p
                      key={message.timestamp.toISOString()}
                      className={
                        isAi ? "ai-message bg-blue-200" : "user-message"
                      }
                    >
                      {isAi ? "Agent: " : "You: "}

                      {message.text}
                    </p>
                  );
                }
              })}

            <p className="live-transcript">{transcript}</p>
          </div>
        </div>

        {/* 2. Main Content Area: Visualizer and Video */}

        <div className="main-content">
          {/* Central Audio Visualizer/Status Indicator */}

          <div className="visualizer">
            <div
              className={`visualizer-circle ${
                !isUserTurn ? "is-speaking" : "is-listening"
              }`}
            >
              {isUserTurn ? "🎙️" : "🔊"}
            </div>

            <div className="visualizer-text">
              {isMounted &&
                (!isUserTurn
                  ? "Agent is Speaking..."
                  : "Listening for Answer...")}
            </div>
          </div>

          {/* 3. Small User Video Block (Webcam) */}

          <div className="user-video-block">
            <div className="video-placeholder">
              <WebCameraCapture />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIInterview;
