import express, { Request, Response } from "express";
import "express-async-errors";
import { handleError } from "../middleware/error.middleware";
import { login } from "../controllers/auth.controller";
import { ticketsRouter } from "../routes/tickets.router";
import { exportsRouter } from "../routes/exports.router";
import { adminRouter } from "../routes/admin.router";

// Create Express app
const app = express();

// JSON parsing middleware
app.use(express.json());

// API routes
app.post("/api/auth/login", login);
app.use("/api/tickets", ticketsRouter);
app.use("/api/exports", exportsRouter);
app.use("/api/admin", adminRouter);

// Liveness: the process is up
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Readiness: routes are registered and the server is accepting requests
app.get("/ready", (_req: Request, res: Response) => {
  res.json({ status: "ready", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// Central error handler — must be after all other middleware
app.use(handleError);

// Start server if this file is run directly (typeof guard keeps ESM test imports quiet)
if (typeof require !== "undefined" && require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  // Development listeners bind to loopback only
  const host = process.env.HOST || "127.0.0.1";
  const server = app.listen(port, host, () => {
    console.log(`Support Desk API listening on http://${host}:${port}`);
  });
  const shutdown = (signal: string) => {
    console.log(`${signal} received; shutting down gracefully`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

export { app };
