import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = err?.status || 500;
  const message = err?.message || "Internal Server Error";

  // Log the error with request context
  logger.error("Unhandled error in request", {
    path: req.path,
    method: req.method,
    status,
    message,
    stack: err?.stack,
  });

  const payload: any = { error: message };
  if (process.env.NODE_ENV !== "production") {
    payload.stack = err?.stack;
  }

  res.status(status).json(payload);
}

export default errorHandler;
