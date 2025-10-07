import path from "path";
import { pdf } from "pdf-parse";
import { readFile } from "node:fs/promises";

import { Applicant, User } from "../models/index.js";
import { BaseController, ControllerResponse } from "./base/BaseController.ts";
import { StructureResumeAgent } from "../agents/StructureResumeAgent.js";

export interface CreateApplicantData {
  userId: string;
  salaryExpectation?: {
    min: number;
    max: number;
    currency: string;
  };
  resumeFile: {
    originalname: string;
    path: string;
  };
}

export interface UpdateApplicantData {
  salaryExpectation?: {
    min: number;
    max: number;
    currency: string;
  };
  structuredData?: {
    name?: string;
    email?: string;
    phone?: string;
    experience?: any[];
    education?: any[];
    skills?: string[];
    projects?: any[];
  };
}

export interface StructuredResumeData {
  name: string;
  email: string;
  phone: string;
  experience: any[];
  education: any[];
  skills: string[];
  projects: any[];
}

export class ApplicantController extends BaseController {
  async createApplicant(
    data: CreateApplicantData
  ): Promise<ControllerResponse> {
    try {
      const { userId, salaryExpectation, resumeFile } = data;

      // Validate required fields
      const validationError = this.validateRequired({ userId, resumeFile });
      if (validationError) {
        return this.badRequest(validationError);
      }

      // Check if user exists and is an applicant
      const user = await User.findById(userId);
      if (!user || user.role !== "applicant") {
        return this.badRequest("Invalid user or user is not an applicant");
      }

      // Check if applicant profile already exists
      const existingApplicant = await Applicant.findOne({ userId });
      if (existingApplicant) {
        return this.badRequest("Applicant profile already exists");
      }

      // Extract text from PDF
      const extractedText = await this.extractTextFromPDF(resumeFile.path);

      // Structure the resume data using AI
      const structuredData = await this.structureResumeData(extractedText);

      // Create applicant
      const applicant = new Applicant({
        userId,
        resume: {
          fileName: resumeFile.originalname,
          filePath: resumeFile.path,
          extractedText,
          structuredData,
        },
        salaryExpectation,
      });

      await applicant.save();

      return this.created(
        { applicant },
        "Applicant profile created successfully"
      );
    } catch (error) {
      console.error("Error creating applicant:", error);
      return this.internalError("Failed to process resume");
    }
  }

  async getApplicant(userId: string): Promise<ControllerResponse> {
    try {
      const applicant = await Applicant.findOne({ userId })
        .populate("userId", "name email profile")
        .populate("applications");

      if (!applicant) {
        return this.notFound("Applicant profile not found");
      }

      return this.success({ applicant });
    } catch (error) {
      console.error("Error fetching applicant:", error);
      return this.internalError("Failed to fetch applicant profile");
    }
  }

  async updateApplicant(
    userId: string,
    updateData: UpdateApplicantData
  ): Promise<ControllerResponse> {
    try {
      const { salaryExpectation, structuredData } = updateData;

      const updateFields: any = {};

      if (salaryExpectation) {
        updateFields.salaryExpectation = salaryExpectation;
      }

      if (structuredData) {
        updateFields["resume.structuredData"] = structuredData;
      }

      const applicant = await Applicant.findOneAndUpdate(
        { userId },
        updateFields,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!applicant) {
        return this.notFound("Applicant profile not found");
      }

      return this.success(
        { applicant },
        "Applicant profile updated successfully"
      );
    } catch (error) {
      console.error("Error updating applicant:", error);
      return this.internalError("Failed to update applicant profile");
    }
  }

  private async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      // Try using pdf-parse to handle text-based PDFs
      const textFromPdf = await this.extractTextUsingPdfParse(filePath);
      if (textFromPdf && textFromPdf.trim().length > 10) {
        console.log(
          `Successfully extracted ${textFromPdf.length} characters from PDF`
        );
        return textFromPdf;
      }

      // If text extraction returns insufficient content, provide fallback
      console.log(
        "Text extraction returned minimal content, using fallback..."
      );
      return await this.extractTextUsingOCR(filePath);
    } catch (error) {
      console.error("Error in PDF text extraction:", error);
      // Return fallback text that includes filename info to help with manual processing
      const fileName = path.basename(filePath);
      return `PDF text extraction failed for file: ${fileName}. This may be a scanned PDF or image-based document that requires OCR processing. Manual review may be needed to extract resume information.`;
    }
  }

  private async extractTextUsingPdfParse(filePath: string): Promise<string> {
    try {
      const buffer = await readFile(filePath);

      const data = await pdf(buffer);
      return data.text || "";
    } catch (error) {
      console.error("pdf-parse extraction failed:", error);
      throw error;
    }
  }

  private async extractTextUsingOCR(filePath: string): Promise<string> {
    console.log("OCR extraction not available!");
    return "OCR extraction not available. Please ensure PDF contains selectable text.";
  }

  private async structureResumeData(
    extractedText: string
  ): Promise<StructuredResumeData> {
    try {
      // Use the AI-powered StructureResumeAgent to parse the resume
      const aiStructuredData = await StructureResumeAgent.parseResume(
        extractedText
      );

      // Convert to the format expected by the controller
      return {
        name: aiStructuredData.name,
        email: aiStructuredData.email,
        phone: aiStructuredData.phone,
        experience: aiStructuredData.experience,
        education: aiStructuredData.education,
        skills: aiStructuredData.skills,
        projects: aiStructuredData.projects,
      };
    } catch (error) {
      console.error("Error structuring resume data:", error);
      // Fallback to basic structure if AI parsing fails
      return {
        name: "Name extraction failed",
        email: "Email extraction failed",
        phone: "Phone extraction failed",
        experience: [],
        education: [],
        skills: [],
        projects: [],
      };
    }
  }
}
