// 예시파일입니다. 필요시 지우고 사용하세요.
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import * as service from "./products.service.js";

export const purchase = asyncHandler(async (req, res) => {
  const buyerId = req.auth.userId; //  유저 기능 적용
  const { listingId } = req.params;
  const { quantity } = req.body;

  const result = await service.purchaseListing({
    buyerId,
    listingId,
    quantity,
  });

  return res.status(201).json(result);
});

export const createExchangeOffer = asyncHandler(async (req, res) => {
  const offeredById = req.auth.userId; //  유저 기능 적용
  const { listingId } = req.params;
  const { offeredDescription } = req.body;

  const result = await service.createExchangeOffer({
    offeredById,
    listingId,
    offeredDescription,
  });
  return res.status(201).json(result);
});

// 마켓플레이스 판매 카드 목록
export const getMarketplaceListings = asyncHandler(async (req, res) => {
  const params = req.query; // 검색, 필터, 정렬, cursor, take 등
  const listings = await service.getMarketplaceListingsService(params);
  res.status(200).json({ data: listings });
});

// 내 포토카드 목록
export const getMyPhotoCards = asyncHandler(async (req, res) => {
  const userId = req.user?.id ?? req.query.userId;
  const params = req.query;
  const photos = await service.getMyPhotoCardsService(userId, params);
  res.status(200).json({ data: photos });
});

// 포토카드 상세 조회
export const getMyPhotoCardById = asyncHandler(async (req, res) => {
  const { myPhotoCardId } = req.params;
  const photo = await service.getMyPhotoCardByIdService(myPhotoCardId);
  res.status(200).json(photo);
});

// 판매 등록
export const createListing = asyncHandler(async (req, res) => {
  const sellerId = req.user?.id ?? req.body.sellerId;
  const data = { ...req.body, sellerId };
  const listing = await service.createListingService(data);
  res.status(201).json({ success: true, message: "판매 등록이 완료되었습니다.", listing });
});
