import express from "express";
import type { Request, Response } from "express";
import asyncWrapper from "../middleware/asyncWrapper.js";
import { JobController } from "../controllers/JobController.js";
import { AuthenticatedRequest } from "../middleware/jwtAuthentication.js";

const router = express.Router();
const jobController = new JobController();

// Create a new job posting
router.post(
  "/",
  asyncWrapper(async (req: AuthenticatedRequest, res: Response) => {
    const result = await jobController.createJob(req.body);
    return jobController.sendResponse(res, result);
  })
);

// Get all jobs (with filters)
router.get(
  "/",
  asyncWrapper(async (req: AuthenticatedRequest, res: Response) => {
    const result = await jobController.getJobs(req.query as any);
    return jobController.sendResponse(res, result);
  })
);

// Get job by ID
router.get(
  "/:id",
  asyncWrapper(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const result = await jobController.getJobById(id);
    return jobController.sendResponse(res, result);
  })
);

// Update job
router.put(
  "/:id",
  asyncWrapper(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const result = await jobController.updateJob(id, req.body);
    return jobController.sendResponse(res, result);
  })
);

// Delete job
router.delete(
  "/:id",
  asyncWrapper(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const result = await jobController.deleteJob(id);
    return jobController.sendResponse(res, result);
  })
);

export default router;
