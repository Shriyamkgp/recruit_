import express from "express";
import type { Request, Response } from "express";
import asyncWrapper from "../middleware/asyncWrapper.js";
import { ApplicantController } from "../controllers/ApplicantController.js";
import multer from "multer";
import path from "path";

const router = express.Router();
const applicantController = new ApplicantController();



// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/resumes/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Create applicant profile
router.post(
  "/",
  upload.single("resume"),
  asyncWrapper(async (req: Request, res: Response) => {
    const { userId, salaryExpectation } = req.body;
    const resumeFile = req.file;

    const createData = {
      userId,
      salaryExpectation: salaryExpectation
        ? JSON.parse(salaryExpectation)
        : undefined,
      resumeFile: resumeFile
        ? {
            originalname: resumeFile.originalname,
            path: resumeFile.path,
          }
        : undefined,
    };

    const result = await applicantController.createApplicant(createData as any);
    return applicantController.sendResponse(res, result);
  })
);

// Get applicant profile
router.get(
  "/:userId",
  asyncWrapper(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await applicantController.getApplicant(userId);
    return applicantController.sendResponse(res, result);
  })
);

// Update applicant profile
router.put(
  "/:userId",
  asyncWrapper(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { salaryExpectation, structuredData } = req.body;

    const updateData = {
      salaryExpectation,
      structuredData,
    };

    const result = await applicantController.updateApplicant(
      userId,
      updateData
    );
    return applicantController.sendResponse(res, result);
  })
);

export default router;
