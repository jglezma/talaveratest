import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { runMigrations, testConnection } from "./database/connection";

// Routes
import authRoutes from "./routes/auth.routes";
import projectsRoutes from "./routes/projects.routes";
import subscriptionsRoutes from "./routes/subscriptions.routes";
import plansRoutes from "./routes/plans.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log("🚀 Initializing TalaveraTest Backend...");

// Middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.com"]
        : ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

console.log("✅ Middleware configured");

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "talaveratest-api",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/plans", plansRoutes);

console.log("✅ Routes configured");

// 404 handler
app.use("*", (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("❌ Unhandled error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
);

// Initialize database and start server
async function startServer() {
  try {
    console.log("🔌 Testing database connection...");
    await testConnection();
    console.log("✅ Database connection successful");

    console.log("🔄 Running migrations...");
    await runMigrations();
    console.log("✅ Migrations completed");

    app.listen(PORT, () => {
      console.log(`🚀 TalaveraTest Backend is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
