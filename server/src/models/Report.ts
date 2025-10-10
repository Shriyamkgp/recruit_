import mongoose, { Document, Schema } from "mongoose";

export interface IReport extends Document {
  applicationId: mongoose.Types.ObjectId;
  interviewSessionId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  analysis: {
    overallScore: number;
    technicalScore: number;
    behavioralScore: number;
    communicationScore: number;
    jobMatchScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    detailedAnalysis: {
      technicalSkills: {
        score: number;
        feedback: string;
        keyPoints: string[];
      };
      problemSolving: {
        score: number;
        feedback: string;
        keyPoints: string[];
      };
      communication: {
        score: number;
        feedback: string;
        keyPoints: string[];
      };
      behavioral: {
        score: number;
        feedback: string;
        keyPoints: string[];
      };
      experienceMatch: {
        score: number;
        feedback: string;
        keyPoints: string[];
      };
    };
  };
  summary: string;
  recommendation:
    | "strongly_recommend"
    | "recommend"
    | "maybe"
    | "not_recommend";
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    interviewSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
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
    analysis: {
      overallScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      technicalScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      behavioralScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      communicationScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      jobMatchScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
      detailedAnalysis: {
        technicalSkills: {
          score: Number,
          feedback: String,
          keyPoints: [String],
        },
        problemSolving: {
          score: Number,
          feedback: String,
          keyPoints: [String],
        },
        communication: {
          score: Number,
          feedback: String,
          keyPoints: [String],
        },
        behavioral: {
          score: Number,
          feedback: String,
          keyPoints: [String],
        },
        experienceMatch: {
          score: Number,
          feedback: String,
          keyPoints: [String],
        },
      },
    },
    summary: {
      type: String,
      required: true,
    },
    recommendation: {
      type: String,
      enum: ["strongly_recommend", "recommend", "maybe", "not_recommend"],
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ReportSchema.index({ applicationId: 1 });
ReportSchema.index({ jobId: 1, "analysis.overallScore": -1 });

export default mongoose.model<IReport>("Report", ReportSchema);
