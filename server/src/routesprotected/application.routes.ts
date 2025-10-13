import express from "express";
import type { Request, Response } from "express";
import asyncWrapper from "../middleware/asyncWrapper.js";
import { ApplicationController } from "../controllers/ApplicationController.js";

const router = express.Router();
const applicationController = new ApplicationController();

// Apply to a job
router.post(
  "/",
  asyncWrapper(async (req: Request, res: Response) => {
    const { jobId, applicantId } = req.body;
    const result = await applicationController.createApplication({
      jobId,
      applicantId,
    });
    return applicationController.sendResponse(res, result);
  })
);

// Get applications for a job (HR view)
router.get(
  "/job/:jobId",
  asyncWrapper(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const result = await applicationController.getApplicationsByJob(
      jobId,
      req.query as any
    );
    return applicationController.sendResponse(res, result);
  })
);

// Get applications for an applicant
router.get(
  "/applicant/:applicantId",
  asyncWrapper(async (req: Request, res: Response) => {
    const { applicantId } = req.params;
    const result = await applicationController.getApplicationsByApplicant(
      applicantId
    );
    return applicationController.sendResponse(res, result);
  })
);

// Get application by ID
router.get(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await applicationController.getApplicationById(id);
    return applicationController.sendResponse(res, result);
  })
);

// Start interview for an application
router.post(
  "/:id/start-interview",
  asyncWrapper(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await applicationController.startInterview(id);
    return applicationController.sendResponse(res, result);
  })
);

// Update application status
router.put(
  "/:id/status",
  asyncWrapper(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await applicationController.updateApplicationStatus(id, {
      status,
    });
    return applicationController.sendResponse(res, result);
  })
);

export default router;
