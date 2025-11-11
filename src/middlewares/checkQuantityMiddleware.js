import { asyncHandler } from "./asyncHandler.js";
import * as repo from "../api/products/products.repository.js";

/**
 * 판매 등록 시 포토카드 보유 수량 검증 미들웨어
 */
export const checkPhotoCardQuantity = asyncHandler(async (req, res, next) => {
  const { myPhotoCardId, quantity } = req.body;

  // 포토카드 조회
  const myPhotoCard = await repo.getMyPhotoCardById(myPhotoCardId);

  if (myPhotoCard.quantity < quantity) {
    return res.status(400).json({ 
      message: `보유 수량(${myPhotoCard.quantity})보다 많은 수량을 등록할 수 없습니다.` 
    });
  }

  // 검증 통과 시 다음 미들웨어로
  next();
});
