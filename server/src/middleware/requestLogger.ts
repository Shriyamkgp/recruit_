import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const { method, path, headers, query } = req;
  const body = req.body;

  logger.info("Incoming request", { method, path, headers: { origin: headers.origin }, query, body });

  // Capture response body
  const oldSend = res.send;
  // @ts-ignore
  res.send = function sendOverWrite(this: Response, bodyToSend: any) {
    try {
      logger.info("Outgoing response", { method, path, status: res.statusCode, responseBody: bodyToSend });
    } catch (err) {
      logger.error("Failed to log response body", { err });
    }
    // @ts-ignore
    return oldSend.call(this, bodyToSend);
  };

  next();
}

export default requestLogger;
