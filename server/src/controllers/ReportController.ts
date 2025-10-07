import { Report, Application, InterviewSession } from "../models/index.js";
import { BaseController, ControllerResponse } from "./base/BaseController.ts";

export interface UpdateRecommendationData {
  recommendation:
    | "strongly_recommend"
    | "recommend"
    | "maybe"
    | "not_recommend";
  notes?: string;
}

export interface GetReportsQuery {
  sortBy?: string;
  order?: "asc" | "desc";
  page?: string;
  limit?: string;
}

export interface ReportStats {
  total: number;
  average: {
    overall: number;
    technical: number;
    behavioral: number;
    communication: number;
    jobMatch: number;
  };
  recommendations: Record<string, number>;
}

export class ReportController extends BaseController {
  async getReportByApplication(
    applicationId: string
  ): Promise<ControllerResponse> {
    try {
      const report = await Report.findOne({ applicationId })
        .populate("applicationId")
        .populate("jobId", "title")
        .populate("applicantId");

      if (!report) {
        return this.notFound("Report not found");
      }

      return this.success({ report });
    } catch (error) {
      console.error("Error fetching report by application:", error);
      return this.internalError("Failed to fetch report");
    }
  }

  async getReportById(id: string): Promise<ControllerResponse> {
    try {
      const report = await Report.findById(id)
        .populate("applicationId")
        .populate("jobId", "title")
        .populate("applicantId")
        .populate("interviewSessionId");

      if (!report) {
        return this.notFound("Report not found");
      }

      return this.success({ report });
    } catch (error) {
      console.error("Error fetching report by ID:", error);
      return this.internalError("Failed to fetch report");
    }
  }

  async getReportsByJob(
    jobId: string,
    query: GetReportsQuery
  ): Promise<ControllerResponse> {
    try {
      const { sortBy = "overallScore", order = "desc" } = query;

      const { page, limit, skip } = this.parsePagination(query);

      // Build sort object
      const sortField = `analysis.${sortBy}`;
      const sortOrder = order === "desc" ? -1 : 1;
      const sortObj: any = {};
      sortObj[sortField] = sortOrder;

      const reports = await Report.find({ jobId })
        .populate("applicantId", "userId resume.structuredData.name")
        .populate("applicationId", "appliedAt status")
        .sort(sortObj)
        .skip(skip)
        .limit(limit);

      const total = await Report.countDocuments({ jobId });
      const pagination = this.createPaginationResponse(page, limit, total);

      return this.success({
        reports,
        pagination,
      });
    } catch (error) {
      console.error("Error fetching reports by job:", error);
      return this.internalError("Failed to fetch reports");
    }
  }

  async getInterviewTranscript(id: string): Promise<ControllerResponse> {
    try {
      const report = await Report.findById(id);
      if (!report) {
        return this.notFound("Report not found");
      }

      const interviewSession = await InterviewSession.findById(
        report.interviewSessionId
      );
      if (!interviewSession) {
        return this.notFound("Interview session not found");
      }

      return this.success({
        transcript: interviewSession.transcript,
        sessionInfo: {
          startedAt: interviewSession.startedAt,
          completedAt: interviewSession.completedAt,
          questionsAsked: interviewSession.questionsAsked,
          status: interviewSession.status,
        },
      });
    } catch (error) {
      console.error("Error fetching interview transcript:", error);
      return this.internalError("Failed to fetch interview transcript");
    }
  }

  async updateRecommendation(
    id: string,
    data: UpdateRecommendationData
  ): Promise<ControllerResponse> {
    try {
      const { recommendation, notes } = data;

      const validRecommendations = [
        "strongly_recommend",
        "recommend",
        "maybe",
        "not_recommend",
      ];

      if (!recommendation || !validRecommendations.includes(recommendation)) {
        return this.badRequest(
          `Invalid recommendation. Valid options: ${validRecommendations.join(
            ", "
          )}`
        );
      }

      const updateData: any = { recommendation };
      if (notes) {
        updateData["analysis.recommendations"] = notes;
      }

      const report = await Report.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!report) {
        return this.notFound("Report not found");
      }

      return this.success(
        { report },
        "Report recommendation updated successfully"
      );
    } catch (error) {
      console.error("Error updating report recommendation:", error);
      return this.internalError("Failed to update report recommendation");
    }
  }

  async getJobReportStats(jobId: string): Promise<ControllerResponse> {
    try {
      const reports = await Report.find({ jobId });

      if (reports.length === 0) {
        return this.success({
          totalReports: 0,
          averageScores: null,
          recommendationBreakdown: {},
        });
      }

      // Calculate averages
      const totalReports = reports.length;
      const averageScores = {
        overall:
          reports.reduce((sum, r) => sum + r.analysis.overallScore, 0) /
          totalReports,
        technical:
          reports.reduce((sum, r) => sum + r.analysis.technicalScore, 0) /
          totalReports,
        behavioral:
          reports.reduce((sum, r) => sum + r.analysis.behavioralScore, 0) /
          totalReports,
        communication:
          reports.reduce((sum, r) => sum + r.analysis.communicationScore, 0) /
          totalReports,
        jobMatch:
          reports.reduce((sum, r) => sum + r.analysis.jobMatchScore, 0) /
          totalReports,
      };

      // Recommendation breakdown
      const recommendationBreakdown = reports.reduce((acc: any, report) => {
        const rec = report.recommendation;
        acc[rec] = (acc[rec] || 0) + 1;
        return acc;
      }, {});

      return this.success({
        totalReports,
        averageScores,
        recommendationBreakdown,
      });
    } catch (error) {
      console.error("Error fetching job report stats:", error);
      return this.internalError("Failed to fetch job report statistics");
    }
  }
}
