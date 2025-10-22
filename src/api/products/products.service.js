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
