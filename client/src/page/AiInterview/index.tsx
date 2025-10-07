import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";

interface JobDetailsProps {
  jobId?: string;
}

interface Message {
  sender: "user" | "ai" | "system";
  text: string;
  timestamp: Date;
}

const AiInterviewPage: React.FC<JobDetailsProps> = ({ jobId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      wsRef.current = new WebSocket("ws://localhost:5000");

      wsRef.current.onopen = () => {
        setIsConnected(true);
        addMessage("system", "🔗 Connected to AI Interview System");
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setInterviewStarted(false);
        addMessage(
          "system",
          "❌ Connection lost. Please refresh to reconnect."
        );
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        addMessage(
          "system",
          "❌ Connection error. Please check if server is running."
        );
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      addMessage("system", "❌ Failed to connect to interview system");
    }
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case "interview_started":
        setInterviewStarted(true);
        addMessage("system", "🎤 Interview started!");
        addMessage("ai", data.message);
        break;

      case "ai_response_complete":
        addMessage("ai", data.data);
        break;

      case "interview_completed":
        addMessage("system", "🎉 " + data.message);
        addMessage("system", "Thank you for completing the interview!");
        setInterviewStarted(false);
        break;

      case "interview_ended":
        addMessage("system", data.message);
        setInterviewStarted(false);
        break;

      case "error":
        addMessage("system", "❌ " + data.message);
        break;

      default:
        console.log("Unknown message type:", data.type);
    }
  };

  const addMessage = (sender: "user" | "ai" | "system", text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        sender,
        text,
        timestamp: new Date(),
      },
    ]);
  };

  const startInterview = () => {
    if (!isConnected || !wsRef.current) {
      addMessage("system", "❌ Please wait for connection to establish");
      return;
    }

    const applicationId = jobId || "60f1b2a3c4d5e6f7g8h9i0j1"; // Default for testing

    wsRef.current.send(
      JSON.stringify({
        type: "start_interview",
        applicationId: applicationId,
      })
    );

    addMessage("user", `Starting interview for job: ${applicationId}`);
  };

  const sendMessage = () => {
    if (!input.trim() || !isConnected || !interviewStarted || !wsRef.current) {
      return;
    }

    const message = input.trim();
    setInput("");

    wsRef.current.send(
      JSON.stringify({
        type: "text_message",
        message: message,
      })
    );

    addMessage("user", message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">🎤 AI Interview Session</h1>

        {/* Connection Status */}
        <div
          className={`p-3 rounded mb-4 ${
            isConnected
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          {jobId && <span className="ml-4">Job ID: {jobId}</span>}
        </div>

        {/* Controls */}
        <div className="mb-4 space-x-2">
          {!interviewStarted ? (
            <button
              onClick={startInterview}
              disabled={!isConnected}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              Start Interview
            </button>
          ) : (
            <span className="text-green-600 font-semibold">
              ✅ Interview In Progress
            </span>
          )}
        </div>

        {/* Chat Messages */}
        <div className="border rounded p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">
              Click "Start Interview" to begin your AI interview session
            </p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 p-2 rounded ${
                  msg.sender === "ai"
                    ? "bg-blue-100 border-l-4 border-blue-500"
                    : msg.sender === "user"
                    ? "bg-green-100 border-l-4 border-green-500"
                    : "bg-yellow-100 border-l-4 border-yellow-500"
                }`}
              >
                <div className="flex justify-between items-start">
                  <strong className="text-sm">
                    {msg.sender === "ai"
                      ? "🤖 AI Interviewer"
                      : msg.sender === "user"
                      ? "👤 You"
                      : "📋 System"}
                  </strong>
                  <span className="text-xs text-gray-500">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1">{msg.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              !isConnected
                ? "Connecting..."
                : !interviewStarted
                ? "Start interview first"
                : "Type your response..."
            }
            disabled={!isConnected || !interviewStarted}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !isConnected || !interviewStarted}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">📋 How it works:</h3>
          <ol className="text-sm space-y-1">
            <li>1. Connection establishes automatically</li>
            <li>2. Click "Start Interview" to begin</li>
            <li>3. Answer AI questions in real-time</li>
            <li>4. All conversations are saved automatically</li>
          </ol>
        </div>
      </div>
    </>
  );
};

export default AiInterviewPage;
