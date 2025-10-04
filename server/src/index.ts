import express from "express";
import interviewRoutes from "./routes/interview.routes.ts";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(cors());
app.use(bodyParser.json());

// CORS middleware to allow requests from frontend
app.use("/api/interview", interviewRoutes);

// Example route
app.get("/", (req: express.Request, res: express.Response) => {
  res.send({ message: "Hello from Express backend 🚀" });
});

// Start server
app
  .listen(PORT, () => {
    console.log(`⚡ Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Failed to start server:", err);
  });
