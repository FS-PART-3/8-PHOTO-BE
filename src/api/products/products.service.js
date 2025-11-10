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
  userId,
  listingId,
  offeredDescription,
  offeredPhotoId,
}) {
  const listing = await repo.findListingById({ where: { id: listingId } });
  if (!listing) {
    const error = new Error("유효하지 않은 listingId 입니다.");
    error.code = 400;
    throw error;
  }

  const myCard = await repo.getMyPhotoCardById({ where: { id: offeredPhotoId } });
  if (!myCard) {
    const error = new Error("존재하지 않는 offeredPhotoId 입니다.");
    error.code = 400;
    throw error;
  }
  if (myCard.userId !== userId) {
    const error = new Error("본인 소유 카드만 교환에 사용할 수 있습니다.");
    error.code = 403;
    throw error;
  }

  const offer = await repo.runCreateExchangeOfferTransaction({
    offeredById: userId,
    listingId,
    offeredDescription,
    offeredPhotoId,
  });

  return {
    offerId: offer.id,
    listingId,
    offeredDescription: offer.offeredDescription,
    offeredPhotoId: offer.offeredPhotoId,
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
// 판매글 상세 조회
export async function getListingDetail({ listingId }) {
  const listing = await repo.findListingById(listingId);

  if (!listing || listing.isDeleted) {
    const err = new Error("존재하지 않는 판매글입니다.");
    err.code = 404;
    throw err;
  }

  const photoCards = Array.isArray(listing.photoCards)
    ? listing.photoCards
    : listing.myPhotoCard
      ? [listing.myPhotoCard]
      : [];
  const primaryCard = photoCards.length > 0 ? photoCards[0] : null;

  const seller = listing.seller
    ? {
        id: listing.seller.id,
        name: listing.seller.name,
      }
    : null;

  return {
    id: listing.id,
    price: listing.price ?? 0,
    quantity: listing.quantity ?? 0,
    initQuantity: listing.initQuantity ?? listing.quantity ?? 0,
    status: listing.status,
    sellerId: listing.sellerId,
    seller,

    myPhotoCard: primaryCard,

    preferredGrade: listing.preferredGrade,
    preferredGenre: listing.preferredGenre,
    preferredDescription: listing.preferredDescription,
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
    params.take,
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
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0),
  );

  // 이번 달 등록 수 확인
  const listingCountThisMonth = await repo.countListingsThisMonth(sellerId, firstDayOfMonthUTC);

  if (listingCountThisMonth >= 3) {
    const error = new Error("한 달에 최대 3장까지만 판매 등록이 가능합니다.");
    error.statusCode = 400;
    throw error;
  }

  return repo.createListing(data);
}
