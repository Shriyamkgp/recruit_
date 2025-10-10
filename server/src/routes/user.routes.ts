import express from "express";
import type { Request, Response } from "express";
import asyncWrapper from "../middleware/asyncWrapper.js";
import { UserController } from "../controllers/UserController.js";
import mongoose from "mongoose";

const router = express.Router();
const userController = new UserController();

// Register a new user (HR or Applicant)
router.post(
  "/register",
  asyncWrapper(async (req: Request, res: Response) => {
    const result = await userController.registerUser(req.body);
    return userController.sendResponse(res, result);
  })
);

// Login user
router.post(
  "/login",
  asyncWrapper(async (req: Request, res: Response) => {
    const result = await userController.loginUser(req.body);
    return userController.sendResponse(res, result);
  })
);

// Get all users (with filters)
router.get(
  "/",
  asyncWrapper(async (req: Request, res: Response) => {
    const result = await userController.getUsers(req.query as any);
    return userController.sendResponse(res, result);
  })
);

// Get users by role
router.get(
  "/role/:role",
  asyncWrapper(async (req: Request, res: Response) => {
    const { role } = req.params;

    // Validate role parameter
    if (!["hr", "applicant"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Invalid role. Must be 'hr' or 'applicant'" });
    }

    const result = await userController.getUsersByRole(
      role as "hr" | "applicant"
    );
    return userController.sendResponse(res, result);
  })
);

// Check if email exists
router.get(
  "/check-email/:email",
  asyncWrapper(async (req: Request, res: Response) => {
    const { email } = req.params;
    const result = await userController.checkEmailExists(email);
    return userController.sendResponse(res, result);
  })
);

// Get user by ID
router.get(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const result = await userController.getUserById(id);
    return userController.sendResponse(res, result);
  })
);

// Update user
router.put(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const result = await userController.updateUser(id, req.body);
    return userController.sendResponse(res, result);
  })
);

// Delete user
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const result = await userController.deleteUser(id);
    return userController.sendResponse(res, result);
  })
);

export default router;
