import { Request, Response, NextFunction } from "express";

type ErrorLike = { statusCode?: number; message?: string; stack?: string };

export function handleError(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error("Error handler caught:", err);

  const error = (err ?? {}) as ErrorLike;
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Don't expose stack traces in production
  const response =
    process.env.NODE_ENV !== "production"
      ? { error: message, stack: error.stack }
      : { error: message };

  res.status(statusCode).json(response);
}

// Validation error handler for Zod/express-validator
export function handleValidationError(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const error = (err ?? {}) as ErrorLike & { errors?: Array<{ message?: string }> };
  const statusCode = error.statusCode || 400;
  const message = error.errors ? error.errors.map((e) => e.message).join(", ") : error.message;

  res.status(statusCode).json({ error: message });
}

// Not found handler
export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Not Found" });
}
