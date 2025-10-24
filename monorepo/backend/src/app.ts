import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { runMigrations } from "./database/connection";

// Routes
import authRoutes from "./routes/auth.routes";
import projectsRoutes from "./routes/projects.routes";
import subscriptionsRoutes from "./routes/subscriptions.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// Alias route for plans
app.use(
  "/api/plans",
  (req, res, next) => {
    req.url = "/api/subscriptions/plans";
    next();
  },
  subscriptionsRoutes
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);

    // Don't send stack trace in production
    const errorResponse = {
      error: "Internal server error",
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    };

    res.status(err.status || 500).json(errorResponse);
  }
);

// Initialize database and start server
const startServer = async () => {
  try {
    console.log("🔄 Running database migrations...");
    await runMigrations();
    console.log("✅ Database migrations completed successfully");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("🔄 SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("✅ Process terminated");
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;
