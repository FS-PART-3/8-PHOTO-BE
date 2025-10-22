// 예시파일입니다. 필요시 지우고 사용하세요.
import { prisma } from "../../config/db.js";
import { randomUUID } from "crypto";
async function getUserPointBalance(tx, userId) {
  const agg = await tx.point.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return Number(agg._sum.amount || 0);
}

export async function runPurchaseTransaction({ buyerId, listingId, quantity }) {
  return await prisma.$transaction(async (tx) => {
    // 1) 판매글 조회
    const listing = await tx.listing.findUnique({
      where: { id: listingId },
      select: { id: true, sellerId: true, price: true, quantity: true, status: true },
    });

    if (!listing) throw Object.assign(new Error("존재하지 않는 판매글입니다."), { code: 404 });
    if (listing.sellerId === buyerId)
      throw Object.assign(new Error("본인 판매글은 구매할 수 없습니다."), { code: 400 });
    if (listing.status !== "FOR_SALE")
      throw Object.assign(new Error("현재 구매할 수 없는 상태의 판매글입니다."), { code: 400 });
    if (listing.quantity < quantity)
      throw Object.assign(new Error("재고가 부족합니다."), { code: 400 });

    const totalAmount = listing.price * quantity;

    // 2) 포인트 확인
    const buyerBalance = await getUserPointBalance(tx, buyerId);
    if (buyerBalance < totalAmount)
      throw Object.assign(new Error("포인트가 부족합니다."), { code: 400 });

    // 3) 거래 생성
    const transaction = await tx.transaction.create({
      data: { id: randomUUID(), buyerId, listingId, totalAmount, quantity },
    });

    // 4) 포인트 증감 기록
    await tx.point.createMany({
      data: [
        { id: randomUUID(), userId: buyerId, amount: -totalAmount, reason: "PURCHASE" },
        { id: randomUUID(), userId: listing.sellerId, amount: +totalAmount, reason: "SALE" },
      ],
      skipDuplicates: true,
    });

    // 5) 판매글 수량/상태 갱신
    const leftQty = listing.quantity - quantity;
    const listingAfter = await tx.listing.update({
      where: { id: listingId },
      data: {
        quantity: leftQty,
        status: leftQty <= 0 ? "SOLD_OUT" : "FOR_SALE",
      },
      select: { id: true, quantity: true, status: true },
    });

    // 6) 알림 생성
    await tx.notification.createMany({
      data: [
        {
          id: randomUUID(),
          userId: buyerId,
          type: "PURCHASE_COMPLETED",
          payload: { listingId, transactionId: transaction.id, quantity, totalAmount },
        },
        {
          id: randomUUID(),
          userId: listing.sellerId,
          type: leftQty <= 0 ? "SOLD_OUT" : "SALE_COMPLETED",
          payload: { listingId, transactionId: transaction.id, quantity, totalAmount },
        },
      ],
    });

    const buyerBalanceAfter = buyerBalance - totalAmount;
    return { transaction, listingAfter, buyerBalanceAfter, totalAmount };
  });
}
