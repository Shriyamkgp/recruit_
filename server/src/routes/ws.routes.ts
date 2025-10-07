import WebSocket from "ws";
import {
  InterviewController,
  WebSocketWithSession,
  StartInterviewData,
  TextMessageData,
  EndInterviewData,
} from "../controllers/InterviewController.js";

export const handleConnection = async (
  ws: WebSocketWithSession
): Promise<void> => {
  console.log("Client connected for AI interview");

  // Create controller instance for this connection
  const interviewController = new InterviewController();

  // Set up message handling
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());
      switch (data.type) {
        case "start_interview":
          await interviewController.startInterview(
            ws,
            data as StartInterviewData
          );
          break;
        case "text_message":
          await interviewController.processMessage(ws, data as TextMessageData);
          break;
        case "end_interview":
          await interviewController.endInterview(ws, data as EndInterviewData);
          break;
        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("WebSocket message handling error:", error);
      sendError(ws, "Failed to process message");
    }
  });

  // Set up connection cleanup
  ws.on("close", async () => {
    console.log("Client disconnected");
    await interviewController.handleDisconnection(ws);
  });

  // Set up error handling
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
};

// WebSocket utility functions
function sendError(ws: WebSocket, message: string): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: "error",
        message,
      })
    );
  }
}
