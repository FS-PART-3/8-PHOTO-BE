import * as repo from "./exchanges.repository.js";

export async function approveExchangeOffer({ sellerId, offerId }) {
  const { offerAfter, listingAfter } = await repo.runApproveExchangeOfferTransaction({
    sellerId,
    offerId,
  });

  return {
    exchangeId: offerAfter.id,
    listingId: offerAfter.listingId,
    offerStatus: offerAfter.status, // ACCEPTED
    listingStatus: listingAfter.status,
    listingQuantity: listingAfter.quantity, // 남은수량 반환
  };
}
export async function rejectExchangeOffer({ sellerId, offerId }) {
  return await repo.runRejectExchangeOfferTransaction({ sellerId, offerId });
}

export async function cancelExchangeOffer({ offeredById, offerId }) {
  return await repo.runCancelExchangeOfferTransaction({ offeredById, offerId });
}
function toClientOfferForBuyer(o) {
  return {
    id: o.id,
    status: o.status,
    offeredDescription: o.offeredDescription || "",
    createdAt: o.createdAt,
    offeredByName: o.offeredBy?.name || null,
    price: o.offeredPhoto?.price || null,
    myCard: o.offeredPhoto
      ? {
          id: o.offeredPhoto.id,
          title: o.offeredPhoto.title,
          grade: o.offeredPhoto.grade,
          genre: o.offeredPhoto.genre,
          quantity: Number(o.offeredPhoto.quantity ?? 0),
          imgUrl: o.offeredPhoto.imgUrl || null,
        }
      : null,
  };
}

function toClientOfferForSeller(o) {
  return {
    id: o.id,
    status: o.status,
    offeredDescription: o.offeredDescription || "",
    createdAt: o.createdAt,
    buyer: { id: o.offeredById, name: o.offeredBy?.name ?? null },
    myCard: o.offeredPhoto
      ? {
          id: o.offeredPhoto.id,
          title: o.offeredPhoto.title,
          grade: o.offeredPhoto.grade,
          genre: o.offeredPhoto.genre,
          quantity: Number(o.offeredPhoto.quantity ?? 0),
          imgUrl: o.offeredPhoto.imgUrl || null,
        }
      : null,
  };
}

export async function getExchangeOffers({ listingId, userId, mine }) {
  if (!listingId) throw new Error("listingId가 필요합니다.");
  if (!userId) throw new Error("로그인이 필요합니다.");

  if (mine) {
    const rows = await repo.findOffersByUser({ listingId, userId });
    return rows.map(toClientOfferForBuyer);
  }
  const rows = await repo.findOffersForSeller({ listingId, sellerId: userId });
  return rows.map(toClientOfferForSeller);
}

export const getMyExchangeOffers = (args) => getExchangeOffers({ ...args, mine: true });
export const getOffersForMyListing = (args) => getExchangeOffers({ ...args, mine: false });
