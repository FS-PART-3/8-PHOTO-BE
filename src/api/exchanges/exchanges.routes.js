import { Router } from "express";
import * as controller from "./exchanges.controller.js";
import { verifyAccessToken } from "../../middlewares/authGuard.js";
const router = Router();

// 교환 승인
router.patch(
  "/marketplace/exchange-offers/:offerId/accept",
  verifyAccessToken,
  controller.approveExchangeOffer,
);

// 교환 거절
router.patch(
  "/marketplace/exchange-offers/:offerId/reject",
  verifyAccessToken,
  controller.rejectExchangeOffer,
);

// 교환 취소
router.patch(
  "/marketplace/exchange-offers/:offerId/cancel",
  verifyAccessToken,
  controller.cancelExchangeOffer,
);

export default router;
