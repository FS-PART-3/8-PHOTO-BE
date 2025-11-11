import { Router } from "express";
import * as controller from "./gallery.controller.js";
import { validate } from "../../middlewares/validateMiddleware.js";
import {
  getMyGallerySchema,
  createPhotoCardSchema,
} from "./validators/gallery.validators.js";
import { upload } from "../../middlewares/uploadMiddleware.js";
import { verifyAccessToken } from "../../middlewares/authGuard.js";
import "./docs/gallery.swagger.js";

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
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "watermark", maxCount: 1 },
  ]),
  validate(createPhotoCardSchema),
  controller.createPhotoCard
);

export default router;
