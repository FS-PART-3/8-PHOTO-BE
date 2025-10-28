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
