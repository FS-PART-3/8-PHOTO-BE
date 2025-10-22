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
export async function createExchangeOffer({ offeredById, listingId, offeredDescription }) {
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
