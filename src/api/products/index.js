import { Router } from "express";
import productsRouter from "./products.routes.js";

const router = Router();

router.get("/ping", (_req, res) => res.json({ pong: true }));

router.use("/", productsRouter);

export default router;
