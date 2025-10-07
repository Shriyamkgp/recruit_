import {
  Application,
  Job,
  Applicant,
  InterviewSession,
} from "../models/index.js";
import { BaseController, ControllerResponse } from "./base/BaseController.ts";

export interface CreateApplicationData {
  jobId: string;
  applicantId: string;
}

export interface UpdateApplicationStatusData {
  status:
    | "applied"
    | "interview_pending"
    | "interview_completed"
    | "selected"
    | "rejected";
}

export interface GetApplicationsQuery {
  status?: string;
  page?: string;
  limit?: string;
}

export class ApplicationController extends BaseController {
  async createApplication(
    data: CreateApplicationData
  ): Promise<ControllerResponse> {
    try {
      const { jobId, applicantId } = data;

      // Validate required fields
      const validationError = this.validateRequired({ jobId, applicantId });
      if (validationError) {
        return this.badRequest(validationError);
      }

      // Check if job exists and is active
      const job = await Job.findById(jobId);
      if (!job || job.status !== "active") {
        return this.badRequest("Job not found or not active");
      }

      // Check if applicant exists
      const applicant = await Applicant.findById(applicantId);
      if (!applicant) {
        return this.badRequest("Applicant not found");
      }

      // Check if already applied
      const existingApplication = await Application.findOne({
        jobId,
        applicantId,
      });
      if (existingApplication) {
        return this.badRequest("Already applied to this job");
      }

      // Create application
      const application = new Application({
        jobId,
        applicantId,
        status: "applied",
        appliedAt: new Date(),
      });

      await application.save();

      // Add application to applicant's applications list
      applicant.applications.push(application._id as any);
      await applicant.save();

      return this.created(
        { application },
        "Application submitted successfully"
      );
    } catch (error) {
      console.error("Error creating application:", error);
      return this.internalError("Failed to create application");
    }
  }

  async getApplicationsByJob(
    jobId: string,
    query: GetApplicationsQuery
  ): Promise<ControllerResponse> {
    try {
      const { status } = query;
      const { page, limit, skip } = this.parsePagination(query);

      const filter: any = { jobId };
      if (status) {
        filter.status = status;
      }

      const applications = await Application.find(filter)
        .populate("applicantId")
        .populate("jobId", "title")
        .populate("reportId")
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Application.countDocuments(filter);
      const pagination = this.createPaginationResponse(page, limit, total);

      return this.success({
        applications,
        pagination,
      });
    } catch (error) {
      console.error("Error fetching applications by job:", error);
      return this.internalError("Failed to fetch applications");
    }
  }

  async getApplicationsByApplicant(
    applicantId: string
  ): Promise<ControllerResponse> {
    try {
      const applications = await Application.find({ applicantId })
        .populate("jobId")
        .populate("reportId")
        .sort({ appliedAt: -1 });

      return this.success({ applications });
    } catch (error) {
      console.error("Error fetching applications by applicant:", error);
      return this.internalError("Failed to fetch applications");
    }
  }

  async getApplicationById(id: string): Promise<ControllerResponse> {
    try {
      const application = await Application.findById(id)
        .populate("jobId")
        .populate("applicantId")
        .populate("interviewSessionId")
        .populate("reportId");

      if (!application) {
        return this.notFound("Application not found");
      }

      return this.success({ application });
    } catch (error) {
      console.error("Error fetching application:", error);
      return this.internalError("Failed to fetch application");
    }
  }

  async startInterview(id: string): Promise<ControllerResponse> {
    try {
      const application = await Application.findById(id)
        .populate("jobId")
        .populate("applicantId");

      if (!application) {
        return this.notFound("Application not found");
      }

      if (
        application.status !== "applied" &&
        application.status !== "interview_pending"
      ) {
        return this.badRequest(
          "Interview can only be started for applications with 'applied' or 'interview_pending' status"
        );
      }

      // Update application status
      application.status = "interview_pending";
      await application.save();

      return this.success(
        {
          applicationId: application._id,
          instructions: "Connect to WebSocket to begin the AI interview",
        },
        "Interview session ready to start"
      );
    } catch (error) {
      console.error("Error starting interview:", error);
      return this.internalError("Failed to start interview");
    }
  }

  async updateApplicationStatus(
    id: string,
    data: UpdateApplicationStatusData
  ): Promise<ControllerResponse> {
    try {
      const { status } = data;

      const validStatuses = [
        "applied",
        "interview_pending",
        "interview_completed",
        "selected",
        "rejected",
      ];

      if (!status || !validStatuses.includes(status)) {
        return this.badRequest(
          `Invalid status. Valid options: ${validStatuses.join(", ")}`
        );
      }

      const application = await Application.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );

      if (!application) {
        return this.notFound("Application not found");
      }

      return this.success(
        { application },
        "Application status updated successfully"
      );
    } catch (error) {
      console.error("Error updating application status:", error);
      return this.internalError("Failed to update application status");
    }
  }
}
