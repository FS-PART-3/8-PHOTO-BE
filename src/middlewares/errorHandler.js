import { ZodError } from "zod";

export function notFoundHandler(req, res, _next) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(err, req, res, _next) {
  // Zod validation
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.flatten(),
    });
  }

  // Multer
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "File too large" });
  }

  const status = err.code && Number.isInteger(err.code) ? err.code : err.status || 500;
  const payload = {
    message: err.message || "Internal server error",
    name: err.name || "Error",
  };

  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
}
