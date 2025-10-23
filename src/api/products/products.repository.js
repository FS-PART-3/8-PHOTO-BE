// 예시파일입니다. 필요시 지우고 사용하세요.
import { id } from "zod/locales";
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
      select: {
        id: true,
        sellerId: true,
        price: true,
        quantity: true,
        status: true,
      },
    });

    if (!listing)
      throw Object.assign(new Error("존재하지 않는 판매글입니다."), {
        code: 404,
      });
    if (listing.sellerId === buyerId)
      throw Object.assign(new Error("본인 판매글은 구매할 수 없습니다."), {
        code: 400,
      });
    if (listing.status !== "FOR_SALE")
      throw Object.assign(
        new Error("현재 구매할 수 없는 상태의 판매글입니다."),
        { code: 400 }
      );
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
        {
          id: randomUUID(),
          userId: buyerId,
          amount: -totalAmount,
          reason: "PURCHASE",
        },
        {
          id: randomUUID(),
          userId: listing.sellerId,
          amount: +totalAmount,
          reason: "SALE",
        },
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
          payload: {
            listingId,
            transactionId: transaction.id,
            quantity,
            totalAmount,
          },
        },
        {
          id: randomUUID(),
          userId: listing.sellerId,
          type: leftQty <= 0 ? "SOLD_OUT" : "SALE_COMPLETED",
          payload: {
            listingId,
            transactionId: transaction.id,
            quantity,
            totalAmount,
          },
        },
      ],
    });

    const buyerBalanceAfter = buyerBalance - totalAmount;
    return { transaction, listingAfter, buyerBalanceAfter, totalAmount };
  });
}
export async function runCreateExchangeOfferTransaction({
  offeredById,
  listingId,
  offeredDescription,
}) {
  return await prisma.$transaction(async (tx) => {
    // 1) 판매글 조회
    const listing = await tx.listing.findUnique({
      where: { id: listingId },
      select: { id: true, sellerId: true, status: true },
    });
    if (!listing)
      throw Object.assign(new Error("존재하지 않는 판매글입니다."), {
        code: 404,
      });

    if (listing.sellerId === offeredById) {
      throw Object.assign(
        new Error("자신의 판매글에는 교환을 신청할 수 없습니다."),
        { code: 400 }
      );
    }
    if (["CANCELLED", "SOLD_OUT"].includes(listing.status)) {
      throw Object.assign(
        new Error("현재 교환을 신청할 수 없는 상태의 판매글입니다."),
        {
          code: 400,
        }
      );
    }

    // 2) 동일 사용자의 중복 PENDING 신청 방지
    const dup = await tx.exchangeOffer.findFirst({
      where: { listingId, offeredById, status: "PENDING" },
      select: { id: true },
    });
    if (dup) {
      throw Object.assign(new Error("이미 대기 중인 교환 신청이 있습니다."), {
        code: 409,
      });
    }

    // 3) 교환 신청 생성
    const offer = await tx.exchangeOffer.create({
      data: {
        id: randomUUID(),
        offeredBy: { connect: { id: offeredById } },
        listing: { connect: { id: listingId } },
        offeredDescription,
      },
    });

    // 4) 알림: 판매자에게 교환 제안
    await tx.notification.create({
      data: {
        id: randomUUID(),
        userId: listing.sellerId,
        type: "EXCHANGE_PROPOSED",
        payload: {
          listingId,
          offerId: offer.id,
          offeredById,
          offeredDescription,
        },
      },
    });

    return offer;
  });
}

// 마켓플레이스 판매 카드 목록 조회 +검색/필터/정렬
export async function getMarketplaceListings({
  userId,
  search,
  grade,
  genre,
  soldOut,
  sortBy,
  sortOrder,
  cursor,
  take = 15,
}) {
  const where = { userId };

  if (search) where.title = { contains: search, mode: "insensitive" };
  if (grade) where.grade = grade;
  if (genre) where.genre = genre;
  if (soldOut !== undefined) where.quantity = soldOut ? 0 : { gt: 0 };
  const orderBy = {};
  if (sortBy) orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
  else orderBy["createdAt"] = "desc";

  const listings = await prisma.listing.findMany({
    where,
    include: {
      myPhotoCard: true,
      seller: { select: { id: true, name: true } },
    },
    orderBy,
    take,
    skip: cursor ? 1 : 0,
    ...(cursor && { cursor: { id: cursor } }),
  });

  return listings;
}

// 내 포토카드 목록 조회 +검색/필터/정렬
export async function getMyPhotoCards(
  userId,
  search,
  grade,
  genre,
  soldOut,
  sortBy,
  sortOrder,
  cursor,
  take = 6
) {
  const where = { userId };

  if (search) where.title = { contains: search, mode: "insensitive" };
  if (grade) where.grade = grade;
  if (genre) where.genre = genre;
  if (soldOut !== undefined) where.quantity = soldOut ? 0 : { gt: 0 };
  const orderBy = {};
  if (sortBy) orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
  else orderBy["createdAt"] = "desc";

  const photos = await prisma.myPhotoCard.findMany({
    where,
    include: { user: { select: { name: true, id: true } } },
    orderBy,
    take,
    skip: cursor ? 1 : 0,
    ...(cursor && { cursor: { id: cursor } }),
  });

  return photos;
}

// 포토카드 상세 조회
export async function getMyPhotoCardById(myPhotoCardId) {
  return prisma.myPhotoCard.findUnique({
    where: { id: myPhotoCardId },
    include: { user: { select: { name: true, id: true } } },
  });
}

// 판매 등록 (Listing 생성)
export async function createListing({
  myPhotoCardId,
  price,
  quantity,
  preferredGrade,
  preferredGenre,
  preferredDescription,
  sellerId,
}) {
  return prisma.listing.create({
    data: {
      id: randomUUID(),
      myPhotoCard: { connect: { id: myPhotoCardId } },
      seller: { connect: { id: sellerId } },
      price,
      quantity,
      preferredGrade,
      preferredGenre,
      preferredDescription,
      status: "FOR_SALE",
    },
    include: { myPhotoCard: true, seller: true },
  });
}
