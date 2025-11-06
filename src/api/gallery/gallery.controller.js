import { asyncHandler } from "../../middlewares/asyncHandler.js";
import * as service from "./gallery.service.js";

// 마이갤러리 포토카드 조회
export const getMyGallery = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;

  const result = await service.getMyGalleryService(userId, req.query);

  return res.status(200).json(result);
});

// 포토카드 생성
export const createPhotoCard = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;

  const result = await service.createPhotoCardService(
    userId,
    req.body,
    req.files?.image?.[0]
  );

  return res.status(201).json(result);
});
