import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/authGuard.js";
import { pointHistory, points, reward } from "./points.controller.js";

const router = Router();

router.get("/history", verifyAccessToken, pointHistory);
router.get("/current", verifyAccessToken, points);
router.post("/reward", verifyAccessToken, reward);

export default router;
