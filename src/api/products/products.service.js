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
    status: offer.status, // PENDING 상태코드로 변경
    createdAt: offer.createdAt,
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
  const listing = await repo.createListing(data);
  return listing;
}
