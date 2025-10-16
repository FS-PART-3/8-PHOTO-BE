import helmet from "helmet";
import compression from "compression";
import express from "express";

export function applySecurity(app) {
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
}
