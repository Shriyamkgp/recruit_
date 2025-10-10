import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";

// --- Types ---
interface Message {
  sender: "user" | "ai" | "system";
  text: string;
  timestamp: Date;
}

interface WebSocketContextType {
  messages: Message[];
  isConnected: boolean;
  interviewStarted: boolean;
  addMessage: (sender: Message["sender"], text: string) => void;
  startInterview: (jobId: string) => void;
  sendMessage: (message: string) => void;
}

// Set up the default context value
const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

// --- Hook to use the context ---
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

// --- Provider Component ---
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const URL = "ws://localhost:5000";

  // 1. Helper to add messages
  const addMessage = useCallback((sender: Message["sender"], text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        sender,
        text,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // 2. WebSocket Message Handler
  const handleWebSocketMessage = useCallback(
    (data: any) => {
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
    },
    [addMessage]
  );

  // 3. Connection Logic (runs once on mount)
  useEffect(() => {
    try {
      wsRef.current = new WebSocket(URL);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        addMessage("system", "🔗 Connected to AI Interview System");
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setInterviewStarted(false);
        addMessage("system", "❌ Connection lost. Please reconnect.");
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

    // Cleanup function runs when Provider unmounts (e.g., if app closes)
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [addMessage, handleWebSocketMessage]);

  // 4. Function to start interview
  const startInterview = useCallback(
    (applicationId: string) => {
      if (!isConnected || !wsRef.current) {
        addMessage("system", "❌ Please wait for connection to establish");
        return;
      }

      try {
        wsRef.current.send(
          JSON.stringify({
            type: "start_interview",
            applicationId: applicationId,
          })
        );
        setInterviewStarted(true);
        addMessage("user", `Starting interview for job: ${applicationId}`);
      } catch (error) {
        addMessage("system", "❌ Failed to start interview: " + String(error));
      }
    },
    [isConnected, addMessage]
  );

  // 5. Function to send a message
  const sendMessage = useCallback(
    (message: string) => {
      if (
        !message.trim() ||
        !isConnected ||
        !interviewStarted ||
        !wsRef.current
      ) {
        addMessage(
          "system",
          message.trim() ? "Message Found" : "Empty message"
        );
        addMessage("system", isConnected ? "Connected" : "Connection Issue");

        addMessage(
          "system",
          interviewStarted ? "Interview Started" : "Interview Not Started"
        );

        addMessage("system", wsRef.current ? "WebSocket" : "No WebSocket");
        return;
      }

      wsRef.current.send(
        JSON.stringify({
          type: "text_message",
          message: message,
        })
      );

      addMessage("user", message);
    },
    [isConnected, interviewStarted, addMessage]
  );

  // --- Context Value ---
  const value = {
    messages,
    isConnected,
    interviewStarted,
    addMessage,
    startInterview,
    sendMessage,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
