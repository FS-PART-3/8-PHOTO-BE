import { Router } from "express";
import * as controller from "./gallery.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  getMyGallerySchema,
  createPhotoCardSchema,
} from "./validators/gallery.validators.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { verifyAccessToken } from "../../middlewares/authGuard.js";

const router = Router();

// 마이갤러리 포토카드 조회
router.get(
  "/",
  verifyAccessToken,
  validate(getMyGallerySchema),
  controller.getMyGallery
);

// 포토카드 생성
router.post(
  "/",
  verifyAccessToken,
  upload.single("image"),
  validate(createPhotoCardSchema),
  controller.createPhotoCard
);

export default router;
