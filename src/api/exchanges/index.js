import { Router } from "express";
import exchangesRouter from "./exchanges.routes.js";
const router = Router();
router.get("/ping", (_req, res) => res.json({ pong: true }));
router.use("/", exchangesRouter);
export default router;
