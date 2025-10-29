import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/authGuard.js";
import { getMyPoint, reward } from "./points.controller";

const router = Router();

router.get("/my", verifyAccessToken, getMyPoint);
router.post("/reward", verifyAccessToken, reward);

export default router;
