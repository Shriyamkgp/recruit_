import express from "express";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(express.json());

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
