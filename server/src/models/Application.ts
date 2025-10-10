import mongoose, { Document, Schema } from "mongoose";

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  status:
    | "applied"
    | "interview_pending"
    | "interview_completed"
    | "selected"
    | "rejected";
  interviewSessionId?: mongoose.Types.ObjectId;
  reportId?: mongoose.Types.ObjectId;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
  {
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
    status: {
      type: String,
      enum: [
        "applied",
        "interview_pending",
        "interview_completed",
        "selected",
        "rejected",
      ],
      default: "applied",
    },
    interviewSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
ApplicationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IApplication>("Application", ApplicationSchema);
