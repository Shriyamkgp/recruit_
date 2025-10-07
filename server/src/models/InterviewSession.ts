import mongoose, { Document, Schema } from "mongoose";

export interface IConversationTurn {
  speaker: "AI" | "User";
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface IInterviewSession extends Document {
  applicationId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  sessionId: string;
  status: "started" | "in_progress" | "completed" | "terminated";
  transcript: IConversationTurn[];
  questionsAsked: number;
  startedAt: Date;
  completedAt?: Date;
  metadata: {
    jobDescription: string;
    candidateResume: string;
    interviewContext: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationTurnSchema: Schema = new Schema({
  speaker: {
    type: String,
    enum: ["AI", "User"],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  audioUrl: {
    type: String,
  },
});

const InterviewSessionSchema: Schema = new Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Applicant",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["started", "in_progress", "completed", "terminated"],
      default: "started",
    },
    transcript: [ConversationTurnSchema],
    questionsAsked: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    metadata: {
      jobDescription: String,
      candidateResume: String,
      interviewContext: String,
    },
  },
  {
    timestamps: true,
  }
);

// Note: sessionId index is automatically created due to unique: true in schema definition
// InterviewSessionSchema.index({ sessionId: 1 }); // Removed to avoid duplicate index warning
InterviewSessionSchema.index({ applicationId: 1 });
InterviewSessionSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IInterviewSession>(
  "InterviewSession",
  InterviewSessionSchema
);
