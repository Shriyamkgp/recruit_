import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";

import connectDB from "./config/db.js";
import { handleConnection } from "./routes/ws.routes.js";
import { registerRoutes } from "./routes/index.js";
import { registerProtectedRoutes } from "./routesprotected/protected.ts";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { logger } from "./lib/logger.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// Connect to Database
connectDB();

// App middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());
app.use(requestLogger);

// Handle APIs routes
app.get("/", (_req, res) =>
  res.json({ message: "Hello! from _recruit backend..." })
);

registerRoutes(app);
registerProtectedRoutes(app);

app.use(errorHandler);

// Handle WebSocket connections
wss.on("connection", handleConnection);

// Start server
function startServer() {
  server.listen(PORT, () =>
    logger.info(`⚡ Server running on port ${PORT}`, { port: PORT })
  );

  const shutdown = (signal?: string, err?: Error) => {
    if (signal) logger.info(`Received ${signal}, shutting down`, { signal });
    if (err) logger.error("Server error:", { err });
    server.close(() => process.exit(err ? 1 : 0));
  };

  server.on("error", (err) => shutdown(undefined, err));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer();
