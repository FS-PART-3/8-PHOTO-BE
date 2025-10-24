import { Router } from "express";
import * as controller from "./gallery.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  getMyGallerySchema,
  createPhotoCardSchema,
} from "./validators/gallery.validators.js";
import { upload } from "../../middlewares/upload.middleware.js";
// import { authGuard } from "../../middlewares/authGuard.js";

const router = Router();

// 마이갤러리 포토카드 조회
router.get(
  "/",
  // authGuard, // authGuard는 나중에 적용
  validate(getMyGallerySchema),
  controller.getMyGallery
);

// 포토카드 생성
router.post(
  "/",
  // authGuard, // authGuard는 나중에 적용
  upload.single("image"),
  validate(createPhotoCardSchema),
  controller.createPhotoCard
);

export default router;
