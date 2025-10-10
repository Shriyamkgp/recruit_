import { Express } from "express";
import jobRoutes from "./job.routes.js";
import applicantRoutes from "./applicant.routes.js";
import applicationRoutes from "./application.routes.js";
import reportRoutes from "./report.routes.js";
import userRoutes from "./user.routes.js";

export function registerRoutes(app: Express) {
  app.use("/api/users", userRoutes);
  app.use("/api/jobs", jobRoutes);
  app.use("/api/applicants", applicantRoutes);
  app.use("/api/applications", applicationRoutes);
  app.use("/api/reports", reportRoutes);
}

export default registerRoutes;
