import { Router } from "express";
// import { authGuard } from "../../middlewares/authGuard.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  purchaseSchema,
  createExchangeSchema,
  createListingSchema,
} from "./validators/products.validators.js";
import * as controller from "./products.controller.js";

const router = Router();

router.post(
  "/marketplace/:listingId/purchase",
  //   authGuard,           //authGuard는 나중에 적용
  validate(purchaseSchema),
  controller.purchase
);

// 교환 신청 생성
router.post(
  "/marketplace/:listingId/exchanges",
  //   authGuard, //authGuard는 나중에 적용
  validate(createExchangeSchema),
  controller.createExchangeOffer
);

// 마켓플레이스 판매 카드 목록 조회
router.get("/marketplace", controller.getMarketplaceListings);

// 내 포토카드 목록 조회
router.get("/marketplace/my-photo-cards", controller.getMyPhotoCards);

// 포토카드 상세 조회
router.get(
  "/marketplace/my-photo-cards/:myPhotoCardId",
  controller.getMyPhotoCardById
);

// 판매 등록
router.post(
  "/marketplace/listings",
  validate(createListingSchema),
  controller.createListing
);

export default router;
