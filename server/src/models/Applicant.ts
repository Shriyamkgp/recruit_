import mongoose, { Document, Schema } from "mongoose";

export interface IApplicant extends Document {
  userId: mongoose.Types.ObjectId;
  resume: {
    fileName: string;
    filePath: string;
    extractedText: string;
    structuredData: {
      name: string;
      email: string;
      phone: string;
      experience: Array<{
        company: string;
        position: string;
        duration: string;
        description: string;
      }>;
      education: Array<{
        institution: string;
        degree: string;
        year: string;
      }>;
      skills: string[];
      projects: Array<{
        name: string;
        description: string;
        technologies: string[];
      }>;
    };
  };
  salaryExpectation: {
    min: number;
    max: number;
    currency: string;
  };
  applications: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ApplicantSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    resume: {
      fileName: {
        type: String,
        required: true,
      },
      filePath: {
        type: String,
        required: true,
      },
      extractedText: {
        type: String,
        required: true,
      },
      structuredData: {
        name: String,
        email: String,
        phone: String,
        experience: [
          {
            company: String,
            position: String,
            duration: String,
            description: String,
          },
        ],
        education: [
          {
            institution: String,
            degree: String,
            year: String,
          },
        ],
        skills: [String],
        projects: [
          {
            name: String,
            description: String,
            technologies: [String],
          },
        ],
      },
    },
    salaryExpectation: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: "USD",
      },
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IApplicant>("Applicant", ApplicantSchema);
