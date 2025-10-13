import { Express } from "express";
import jobRoutesProtected from "./job.routes.js";
import applicantRoutesProtected from "./applicant.routes.js";
import applicationRoutesProtected from "./application.routes.js";
import reportRoutesProtected from "./report.routes.ts";
import userRoutesProtected from "./user.routes.ts";
import { protect } from "../middleware/jwtAuthentication.ts";

export function registerProtectedRoutes(app: Express) {
  app.use("/api/v1/users", protect, userRoutesProtected);
  app.use("/api/v1/jobs", protect, jobRoutesProtected);
  app.use("/api/v1/applicants", protect, applicantRoutesProtected);
  app.use("/api/v1/applications", protect, applicationRoutesProtected);
  app.use("/api/v1/reports", protect, reportRoutesProtected);
}

export default registerProtectedRoutes;
