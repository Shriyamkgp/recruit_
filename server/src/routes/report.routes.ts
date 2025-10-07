import express from "express";
import type { Request, Response } from "express";
import asyncWrapper from "../middleware/asyncWrapper.js";
import { ReportController } from "../controllers/ReportController.js";

const router = express.Router();
const reportController = new ReportController();

// Get report by application ID
router.get(
  "/application/:applicationId",
  asyncWrapper(async (req: Request, res: Response) => {
    const { applicationId } = req.params;
    const result = await reportController.getReportByApplication(applicationId);
    return reportController.sendResponse(res, result);
  })
);

// Get report by ID
router.get(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await reportController.getReportById(id);
    return reportController.sendResponse(res, result);
  })
);

// Get all reports for a job (HR view)
router.get(
  "/job/:jobId",
  asyncWrapper(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const result = await reportController.getReportsByJob(
      jobId,
      req.query as any
    );
    return reportController.sendResponse(res, result);
  })
);

// Get interview transcript
router.get(
  "/:id/transcript",
  asyncWrapper(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await reportController.getInterviewTranscript(id);
    return reportController.sendResponse(res, result);
  })
);

// Update report recommendation
router.put(
  "/:id/recommendation",
  asyncWrapper(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { recommendation, notes } = req.body;
    const result = await reportController.updateRecommendation(id, {
      recommendation,
      notes,
    });
    return reportController.sendResponse(res, result);
  })
);

// Get report summary statistics for a job
router.get(
  "/job/:jobId/stats",
  asyncWrapper(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const result = await reportController.getJobReportStats(jobId);
    return reportController.sendResponse(res, result);
  })
);

export default router;
