import React, { useState, useCallback } from "react";
import "./interviewlayout.css";
import TextToSpeech from "./text-to-speech";
import Dictaphone from "./speech-to-text";

interface IndexProps {
  jobId: string; // We expect jobId to be a string
}

function index({ jobId }: IndexProps) {
  // State to hold the transcript received from the child
  const [isSpeechComplete, setIsSpeechComplete] = useState(false);
  const [transcript, setTranscript] = useState("");

  // 1. Function called by the TextToSpeech component when it finishes speaking
  const handleSpeechComplete = useCallback(() => {
    console.log("TTS sequence finished. Starting Dictaphone.");
    setIsSpeechComplete(true); // Set state to true to unmount TTS and mount Dictaphone
  }, []);

  // Handler for STT (from previous discussion)
  const handleTranscriptChange = useCallback((newTranscript: string) => {
    setTranscript(newTranscript);
    // You could also add logic here to stop the Dictaphone after the first recognized speech
  }, []);

  return (
    <>
      {!isSpeechComplete ? (
        <TextToSpeech
          text_input="Hello, How are you doing? Please speak after you hear the chime."
          onSpeechComplete={handleSpeechComplete}
        />
      ) : (
        <>
          <Dictaphone onTranscriptChange={handleTranscriptChange} />
        </>
      )}
      {console.log("executed")}

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

        {/* 2. Main Content Area for Video/Visualizer
         */}
        <div className="main-content">
          {/* 3. Central Audio Visualizer/Circle
           */}
          <div className="visualizer">
            <div className="visualizer-circle">🔊</div>
            <div className="visualizer-text">AI is Speaking...</div>
          </div>

          {/* 4. Small User Video Block (Like Google Meets)
           */}
          <div className="user-video-block">
            <div className="video-placeholder">Your Camera Feed</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default index;
