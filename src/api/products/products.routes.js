import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/authGuard.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  purchaseSchema,
  createExchangeSchema,
  updateListingSchema,
  createListingSchema,
} from "./validators/products.validators.js";
import * as controller from "./products.controller.js";

const router = Router();

router.post(
  "/marketplace/:listingId/purchase",
  verifyAccessToken,
  validate(purchaseSchema),
  controller.purchase,
);

// 교환 신청 생성
router.post(
  "/marketplace/:listingId/exchanges",
  verifyAccessToken,
  validate(createExchangeSchema),
  controller.createExchangeOffer,
);
// 판매 수정
router.patch(
  "/marketplace/:listingId",
  verifyAccessToken,
  validate(updateListingSchema),
  controller.updateListing,
);

// 판매 내리기 (판매 취소)
router.patch("/marketplace/:listingId/cancel", verifyAccessToken, controller.cancelListing);

// 마켓플레이스 판매 카드 목록 조회
router.get("/marketplace", controller.getMarketplaceListings);

// 내 포토카드 목록 조회
router.get("/marketplace/my-photo-cards", controller.getMyPhotoCards);

// 포토카드 상세 조회
router.get("/marketplace/my-photo-cards/:myPhotoCardId", controller.getMyPhotoCardById);

// 판매 등록
router.post("/marketplace/listings", validate(createListingSchema), controller.createListing);

export default router;
