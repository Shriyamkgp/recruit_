import WebSocket from "ws";

import { InterviewSession, Application } from "../models/index.js";
import { interviewAgentResponse } from "../agents/InterviewAgent.ts";
import { generateInterviewReport } from "../agents/ReportAgent.ts";
import { BaseController } from "./base/BaseController.ts";

export interface WebSocketWithSession extends WebSocket {
  sessionId?: string;
}

export interface StartInterviewData {
  type: "start_interview";
  applicationId: string;
}

export interface TextMessageData {
  type: "text_message";
  message: string;
}

export interface EndInterviewData {
  type: "end_interview";
}

export type WebSocketMessage =
  | StartInterviewData
  | TextMessageData
  | EndInterviewData
  | { type: string; [key: string]: any };

export interface ConversationTurn {
  speaker: string;
  text: string;
}

export class InterviewController extends BaseController {
  private conversationHistories: Map<string, ConversationTurn[]> = new Map();

  async startInterview(
    ws: WebSocketWithSession,
    data: StartInterviewData
  ): Promise<void> {
    try {
      const { applicationId } = data;

      if (!applicationId) {
        this.sendError(ws, "Application ID is required");
        return;
      }

      // Get application details
      const application = await Application.findById(applicationId)
        .populate("jobId")
        .populate("applicantId");

      if (!application || !application.jobId || !application.applicantId) {
        this.sendError(ws, "Application not found or incomplete");
        return;
      }

      const job = application.jobId as any;
      const applicant = application.applicantId as any;

      // Create interview session
      const sessionId = `interview_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const interviewSession = new InterviewSession({
        applicationId: application._id,
        jobId: application.jobId._id,
        applicantId: application.applicantId._id,
        sessionId,
        status: "started",
        transcript: [],
        questionsAsked: 0,
        metadata: {
          jobDescription: job.description,
          candidateResume: applicant.resume.extractedText,
          interviewContext: `Interview for ${job.title} position`,
        },
      });

      await interviewSession.save();

      // Update application status
      application.status = "interview_pending";
      application.interviewSessionId = interviewSession._id as any;
      await application.save();

      ws.sessionId = sessionId;

      // Initialize conversation history
      const conversationHistory: ConversationTurn[] = [];
      this.conversationHistories.set(sessionId, conversationHistory);

      // Generate first question
      const context = {
        jobDescription: job.description,
        candidateResume: applicant.resume.extractedText,
        questionsAsked: 0,
      };

      const llmResponseStream = await interviewAgentResponse(
        "",
        conversationHistory,
        context
      );

      let aiResponseText = "";
      for await (const chunk of llmResponseStream) {
        const text = chunk.text();
        if (text) {
          aiResponseText += text;
        }
      }

      // Save AI question to session
      const aiTurn: ConversationTurn = { speaker: "AI", text: aiResponseText };
      conversationHistory.push(aiTurn);

      interviewSession.transcript.push({
        speaker: "AI",
        text: aiResponseText,
        timestamp: new Date(),
      });
      interviewSession.questionsAsked = 1;
      interviewSession.status = "in_progress";
      await interviewSession.save();

      // Send response to client
      this.sendMessage(ws, {
        type: "interview_started",
        sessionId,
        message: aiResponseText,
      });
    } catch (error) {
      console.error("Error starting interview:", error);
      this.sendError(ws, "Failed to start interview");
    }
  }

  async processMessage(
    ws: WebSocketWithSession,
    data: TextMessageData
  ): Promise<void> {
    await this.handleUserMessage(ws, data.message);
  }

  private async handleUserMessage(
    ws: WebSocketWithSession,
    userMessage: string
  ): Promise<void> {
    try {
      if (!ws.sessionId) return;

      const conversationHistory = this.conversationHistories.get(ws.sessionId);
      if (!conversationHistory) return;

      console.log(`User Message: ${userMessage}`);

      // Add user's response to history
      const userTurn: ConversationTurn = { speaker: "User", text: userMessage };
      conversationHistory.push(userTurn);

      // Get session and update
      const session = await InterviewSession.findOne({
        sessionId: ws.sessionId,
      });
      if (!session) return;

      session.transcript.push({
        speaker: "User",
        text: userMessage,
        timestamp: new Date(),
      });
      await session.save();

      // Generate AI response
      const context = {
        jobDescription: session.metadata.jobDescription,
        candidateResume: session.metadata.candidateResume,
        questionsAsked: session.questionsAsked,
      };

      const llmResponseStream = await interviewAgentResponse(
        userMessage,
        conversationHistory,
        context
      );

      let aiResponseText = "";

      // Stream response to client in real-time
      for await (const chunk of llmResponseStream) {
        const text = chunk.text();
        if (text) {
          aiResponseText += text;
          // Send each chunk immediately to client
          this.sendMessage(ws, {
            type: "ai_response_chunk",
            data: text,
          });
        }
      }

      // Save AI response and update session
      console.log(`AI Response: ${aiResponseText}`);

      const aiTurn: ConversationTurn = { speaker: "AI", text: aiResponseText };
      conversationHistory.push(aiTurn);

      session.transcript.push({
        speaker: "AI",
        text: aiResponseText,
        timestamp: new Date(),
      });
      session.questionsAsked += 1;

      // Check if interview is complete
      if (session.questionsAsked >= 11) {
        session.status = "completed";
        session.completedAt = new Date();

        // Update application status
        const application = await Application.findById(session.applicationId);
        if (application) {
          application.status = "interview_completed";
          await application.save();
        }

        // Generate report asynchronously
        generateInterviewReport((session._id as any).toString()).catch(
          (error: any) => {
            console.error("Error generating report:", error);
          }
        );

        this.sendMessage(ws, {
          type: "interview_completed",
          message: "Interview completed successfully",
        });
      }

      await session.save();

      this.sendMessage(ws, {
        type: "ai_response_complete",
        data: aiResponseText,
      });
    } catch (error) {
      console.error("Error handling user message:", error);
    }
  }

  async endInterview(
    ws: WebSocketWithSession,
    data: EndInterviewData
  ): Promise<void> {
    try {
      if (!ws.sessionId) return;

      const session = await InterviewSession.findOne({
        sessionId: ws.sessionId,
      });
      if (session) {
        session.status = "completed";
        session.completedAt = new Date();
        await session.save();

        // Update application status
        const application = await Application.findById(session.applicationId);
        if (application) {
          application.status = "interview_completed";
          await application.save();
        }

        // Generate report
        await generateInterviewReport((session._id as any).toString());
      }

      this.sendMessage(ws, {
        type: "interview_ended",
        message: "Interview ended successfully",
      });
    } catch (error) {
      console.error("Error ending interview:", error);
    }
  }

  async handleDisconnection(ws: WebSocketWithSession): Promise<void> {
    // Mark session as terminated if not completed
    if (ws.sessionId) {
      try {
        const session = await InterviewSession.findOne({
          sessionId: ws.sessionId,
        });
        if (session && session.status !== "completed") {
          session.status = "terminated";
          await session.save();
        }

        // Clean up conversation history
        this.conversationHistories.delete(ws.sessionId);
      } catch (error) {
        console.error("Error updating session on disconnect:", error);
      }
    }
  }

  // Utility methods for WebSocket communication
  sendMessage(ws: WebSocket, message: object): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  sendError(ws: WebSocket, message: string): void {
    this.sendMessage(ws, {
      type: "error",
      message,
    });
  }
}
