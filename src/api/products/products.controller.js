// 예시파일입니다. 필요시 지우고 사용하세요.
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import * as service from "./products.service.js";

export const purchase = asyncHandler(async (req, res) => {
  const buyerId = req.user?.id ?? req.body?.buyerId; //  임시: 바디로 대체
  if (!buyerId) {
    const err = new Error("인증이 필요합니다. (임시: buyerId를 body에 넣어 테스트 가능)");
    err.code = 401;
    throw err;
  }
  //   const buyerId = req.user.id;  //  나중에 authGuard 적용 시 사용
  const { listingId } = req.params;
  const { quantity } = req.body;

  const result = await service.purchaseListing({ buyerId, listingId, quantity });

  return res.status(201).json(result);
});
