import { asyncHandler } from "../../middlewares/asyncHandler.js";
import * as service from "./gallery.service.js";

// 마이갤러리 포토카드 조회
export const getMyGallery = asyncHandler(async (req, res) => {
  const userId = req.user?.id ?? req.query?.userId; // 임시: 쿼리로 대체
  if (!userId) {
    const err = new Error(
      "인증이 필요합니다. (임시: userId를 query에 넣어 테스트 가능)"
    );
    err.code = 401;
    throw err;
  }

  const result = await service.getMyGalleryService(userId, req.query);

  return res.status(200).json(result);
});

// 포토카드 생성
export const createPhotoCard = asyncHandler(async (req, res) => {
  const userId = req.user?.id ?? req.body?.userId; // 임시: 바디로 대체
  if (!userId) {
    const err = new Error(
      "인증이 필요합니다. (임시: userId를 body에 넣어 테스트 가능)"
    );
    err.code = 401;
    throw err;
  }

  const result = await service.createPhotoCardService(
    userId,
    req.body,
    req.file
  );

  return res.status(201).json(result);
});
