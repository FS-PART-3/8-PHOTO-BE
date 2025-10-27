// 예시파일입니다. 필요시 지우고 사용하세요.
import * as repo from "./products.repository.js";

export async function purchaseListing({ buyerId, listingId, quantity }) {
  const { transaction, listingAfter, buyerBalanceAfter, totalAmount } =
    await repo.runPurchaseTransaction({ buyerId, listingId, quantity });

  return {
    transactionId: transaction.id,
    listingId,
    quantity,
    totalAmount,
    buyerBalanceAfter,
    listing: {
      status: listingAfter.status,
      quantity: listingAfter.quantity,
    },
  };
}
export async function createExchangeOffer({
  offeredById,
  listingId,
  offeredDescription,
}) {
  const offer = await repo.runCreateExchangeOfferTransaction({
    offeredById,
    listingId,
    offeredDescription,
  });

  return {
    offerId: offer.id,
    listingId,
    offeredDescription: offer.offeredDescription,
    status: offer.status, // PENDING 상태코드로 변경
    createdAt: offer.createdAt,
  };
}
// 마켓플레이스 판매 수정
export async function updateListing({ sellerId, listingId, payload }) {
  const updated = await repo.updateListing({ sellerId, listingId, payload });
  return {
    id: updated.id,
    price: updated.price,
    quantity: updated.quantity,
    status: updated.status,
    preferredGrade: updated.preferredGrade,
    preferredGenre: updated.preferredGenre,
    preferredDescription: updated.preferredDescription,
    updatedAt: updated.updatedAt,
  };
}
// 마켓플레이스 판매 내리기 (판매 취소)
export async function cancelListing({ sellerId, listingId }) {
  const cancelled = await repo.cancelListing({ sellerId, listingId });
  return {
    id: cancelled.id,
    status: cancelled.status,
  };
}

// 마켓플레이스 판매 카드 조회
export async function getMarketplaceListingsService(params) {
  const listings = await repo.getMarketplaceListings(params);
  return listings;
}

// 내 포토카드 목록 조회
export async function getMyPhotoCardsService(userId, params) {
  const photos = await repo.getMyPhotoCards(
    userId,
    params.search,
    params.grade,
    params.genre,
    params.soldOut,
    params.sortBy,
    params.sortOrder,
    params.cursor,
    params.take
  );
  return photos;
}

// 포토카드 상세 조회
export async function getMyPhotoCardByIdService(myPhotoCardId) {
  const photo = await repo.getMyPhotoCardById(myPhotoCardId);
  return photo;
}

// 판매 등록
export async function createListingService(data) {
  const { sellerId } = data;

  // 이번 달 1일 00:00 계산
  const now = new Date();
  const firstDayOfMonthUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)
  );

  // 이번 달 등록 수 확인
  const listingCountThisMonth = await prisma.listing.count({
    where: {
      sellerId,
      createdAt: { gte: firstDayOfMonthUTC },
    },
  });

  if (listingCountThisMonth >= 3) {
    const error = new Error("한 달에 최대 3장까지만 판매 등록이 가능합니다.");
    error.statusCode = 400;
    throw error;
  }

  const listing = await repo.createListing(data);
  return listing;
}
