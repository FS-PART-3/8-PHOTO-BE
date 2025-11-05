// 예시파일입니다. 필요시 지우고 사용하세요.
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import * as service from "./products.service.js";

export const purchase = asyncHandler(async (req, res) => {
  const buyerId = req.auth?.userId; //  유저 기능 적용
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
  console.log("[createExchangeOffer body]", req.body);
  console.log("[createExchangeOffer params]", req.params);

  const offeredById = req.auth?.userId; //  유저 기능 적용
  const { listingId } = req.params;
  const { offeredDescription, offeredPhotoId } = req.body;

  const result = await service.createExchangeOffer({
    userId: offeredById,
    listingId,
    offeredDescription,
    offeredPhotoId,
  });
  return res.status(201).json(result);
});

// 마켓플레이스 판매 수정
export const updateListing = asyncHandler(async (req, res) => {
  const sellerId = req.auth?.userId;
  const { listingId } = req.params;
  const payload = req.body;

  const updated = await service.updateListing({ sellerId, listingId, payload });
  return res.status(200).json(updated);
});
// 마켓플레이스 판매 내리기 (판매 취소)
export const cancelListing = asyncHandler(async (req, res) => {
  const sellerId = req.auth?.userId;
  const { listingId } = req.params;

  const result = await service.cancelListing({ sellerId, listingId });
  return res.status(200).json(result);
});

// 판매글 상세 조회
export const getListingDetail = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const data = await service.getListingDetail({ listingId });
  res.status(200).json(data);
});

// 마켓플레이스 판매 카드 목록
export const getMarketplaceListings = asyncHandler(async (req, res) => {
  const params = req.query; // 검색, 필터, 정렬, cursor, take 등
  const listings = await service.getMarketplaceListingsService(params);
  res.status(200).json({
    message: "마켓플레이스 판매 카드 목록 조회 성공",
    data: listings,
  });
});

// 내 포토카드 목록
export const getMyPhotoCards = asyncHandler(async (req, res) => {
  const userId = req.auth?.userId;
  const params = req.query;
  const photos = await service.getMyPhotoCardsService(userId, params);
  res.status(200).json({
    message: "내 포토카드 목록 조회 성공",
    data: photos,
  });
});

// 포토카드 상세 조회
export const getMyPhotoCardById = asyncHandler(async (req, res) => {
  const { myPhotoCardId } = req.params;
  const photo = await service.getMyPhotoCardByIdService(myPhotoCardId);
  res.status(200).json({
    message: "포토카드 상세 조회 성공",
    data: photo,
  });
});

// 판매 등록
export const createListing = asyncHandler(async (req, res) => {
  const sellerId = req.auth?.userId;
  if (!sellerId) return res.status(401).json({ message: "로그인이 필요합니다.", data: null });

  const data = { ...req.body, sellerId };

  const listing = await service.createListingService(data);

  res.status(201).json({
    message: "판매 등록이 완료되었습니다.",
    data: listing,
  });
});
