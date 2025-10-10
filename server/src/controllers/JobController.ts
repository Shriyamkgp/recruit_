import { Job } from "../models/index.js";
import { BaseController, ControllerResponse } from "./base/BaseController.ts";

export interface CreateJobData {
  title: string;
  description: string;
  requirements?: string[];
  skills?: string[];
  companyName: string;
  companyDescription?: string;
  location?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  hrId: string;
}

export interface UpdateJobData {
  title?: string;
  description?: string;
  requirements?: string[];
  skills?: string[];
  companyName?: string;
  companyDescription?: string;
  location?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  status?: "active" | "inactive" | "closed";
}

export interface GetJobsQuery {
  status?: string;
  skills?: string | string[];
  location?: string;
  minSalary?: string;
  maxSalary?: string;
  page?: string;
  limit?: string;
}

export class JobController extends BaseController {
  async createJob(data: CreateJobData): Promise<ControllerResponse> {
    try {
      const {
        title,
        description,
        requirements = [],
        skills = [],
        companyName,
        companyDescription,
        location,
        salary = { min: 0, max: 0, currency: "USD" },
        hrId,
      } = data;

      // Validate required fields
      const validationError = this.validateRequired({
        title,
        description,
        companyName,
        hrId,
      });
      if (validationError) {
        return this.badRequest(validationError);
      }

      const job = new Job({
        title,
        description,
        requirements,
        skills,
        companyName,
        companyDescription,
        location,
        salary,
        hrId,
        status: "active",
      });

      await job.save();

      return this.created({ job }, "Job created successfully");
    } catch (error) {
      console.error("Error creating job:", error);
      return this.internalError("Failed to create job");
    }
  }

  async getJobs(query: GetJobsQuery): Promise<ControllerResponse> {
    try {
      const {
        status = "active",
        skills,
        location,
        minSalary,
        maxSalary,
      } = query;

      const { page, limit, skip } = this.parsePagination(query);

      const filter: any = { status };

      if (skills) {
        const skillsArray =
          typeof skills === "string" ? skills.split(",") : skills;
        filter.skills = { $in: skillsArray };
      }

      if (location) {
        filter.location = { $regex: location, $options: "i" };
      }

      if (minSalary || maxSalary) {
        filter["salary.min"] = {};
        if (minSalary) filter["salary.min"].$gte = Number(minSalary);
        if (maxSalary) filter["salary.max"].$lte = Number(maxSalary);
      }

      const jobs = await Job.find(filter)
        .populate("hrId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Job.countDocuments(filter);
      const pagination = this.createPaginationResponse(page, limit, total);

      return this.success({
        jobs,
        pagination,
      });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return this.internalError("Failed to fetch jobs");
    }
  }

  async getJobById(id: string): Promise<ControllerResponse> {
    try {
      const job = await Job.findById(id).populate("hrId", "name email");

      if (!job) {
        return this.notFound("Job not found");
      }

      return this.success({ job });
    } catch (error) {
      console.error("Error fetching job:", error);
      return this.internalError("Failed to fetch job");
    }
  }

  async updateJob(
    id: string,
    data: UpdateJobData
  ): Promise<ControllerResponse> {
    try {
      const job = await Job.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });

      if (!job) {
        return this.notFound("Job not found");
      }

      return this.success({ job }, "Job updated successfully");
    } catch (error) {
      console.error("Error updating job:", error);
      return this.internalError("Failed to update job");
    }
  }

  async deleteJob(id: string): Promise<ControllerResponse> {
    try {
      const job = await Job.findByIdAndDelete(id);

      if (!job) {
        return this.notFound("Job not found");
      }

      return this.success(undefined, "Job deleted successfully");
    } catch (error) {
      console.error("Error deleting job:", error);
      return this.internalError("Failed to delete job");
    }
  }
}
