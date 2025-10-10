import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  companyName: string;
  companyDescription: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  hrId: mongoose.Types.ObjectId;
  status: "active" | "inactive" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: [
      {
        type: String,
        required: true,
      },
    ],
    skills: [
      {
        type: String,
        required: true,
      },
    ],
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyDescription: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    salary: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
        default: "USD",
      },
    },
    hrId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "closed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

JobSchema.index({ title: "text", description: "text", skills: "text" });
JobSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IJob>("Job", JobSchema);
