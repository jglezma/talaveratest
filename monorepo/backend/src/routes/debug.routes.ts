import { Router } from "express";

const router = Router();

router.get("/routes", (req, res) => {
  const routes = [
    // Auth routes
    "POST /api/auth/signup",
    "POST /api/auth/register",
    "POST /api/auth/login",
    "POST /api/auth/signin",
    "GET /api/auth/profile",
    "PUT /api/auth/profile",
    "POST /api/auth/logout",

    // Plans routes
    "GET /api/plans",
    "GET /api/plans/:id",
    "POST /api/plans",

    // Subscriptions routes
    "POST /api/subscriptions",
    "GET /api/subscriptions/current",
    "PUT /api/subscriptions/current", // ← NUEVO
    "GET /api/subscriptions",
    "PUT /api/subscriptions/:id", // ← NUEVO
    "POST /api/subscriptions/current/cancel",
    "DELETE /api/subscriptions/current", // ← NUEVO

    // Projects routes
    "GET /api/projects",
    "POST /api/projects",
    "GET /api/projects/:id",
    "PUT /api/projects/:id",
    "DELETE /api/projects/:id",

    // Debug routes
    "GET /api/debug/routes",

    // Health check
    "GET /health",
  ];

  res.json({
    success: true,
    data: routes,
    count: routes.length,
    message: "Available routes",
    timestamp: new Date().toISOString(),
  });
});

export default router;
