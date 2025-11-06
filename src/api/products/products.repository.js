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
        photoCards: {
          select: {
            id: true,
            userId: true,
            title: true,
            imgUrl: true,
            watermarkUrl: true,
            grade: true,
            genre: true,
            description: true,
            quantity: true,
          },
        },
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

    // 판매자 원본 MyPhotoCard 찾기
    const sellerSourceCard =
      listing.photoCards.find((c) => c.userId === listing.sellerId) ||
      (await tx.myPhotoCard.findFirst({
        where: {
          userId: listing.sellerId,
          listings: { some: { id: listingId } },
        },
        select: { id: true, quantity: true },
      }));

    if (!sellerSourceCard)
      throw Object.assign(
        new Error("판매글의 원본 포토카드를 찾을 수 없습니다."),
        {
          code: 500,
        }
      );
    if (sellerSourceCard.quantity < quantity)
      throw Object.assign(new Error("판매자 보유 수량이 부족합니다."), {
        code: 409,
      });

    // 3) 판매자 MyPhotoCard 보유 수량 차감
    const decCard = await tx.myPhotoCard.updateMany({
      where: {
        id: sellerSourceCard.id,
        userId: listing.sellerId,
        quantity: { gte: quantity },
      },
      data: { quantity: { decrement: quantity } },
    });
    if (decCard.count === 0) {
      throw Object.assign(new Error("판매자 보유 수량이 부족합니다."), {
        code: 409,
      });
    }
    // 4) 판매글 수량 차감
    const decListing = await tx.listing.updateMany({
      where: { id: listingId, status: "FOR_SALE", quantity: { gte: quantity } },
      data: { quantity: { decrement: quantity } },
    });
    if (decListing.count === 0) {
      throw Object.assign(new Error("동시에 변경되어 구매할 수 없습니다."), {
        code: 409,
      });
    }
    // 5) 판매글 상태 업데이트 (수량 0 -> SOLD_OUT)
    let listingAfter = await tx.listing.findUnique({
      where: { id: listingId },
      select: { id: true, quantity: true, status: true },
    });
    if (listingAfter.quantity === 0 && listingAfter.status !== "SOLD_OUT") {
      listingAfter = await tx.listing.update({
        where: { id: listingId },
        data: { status: "SOLD_OUT" },
        select: { id: true, quantity: true, status: true },
      });
    }
    // 나의 포토카드 SOLD_OUT 이면 소프트삭제
    await tx.myPhotoCard.updateMany({
      where: {
        id: sellerSourceCard.id,
        userId: listing.sellerId,
        isDeleted: false,
        quantity: 0,
      },
      data: { isDeleted: true },
    });
    // 6) 거래 생성
    const transaction = await tx.transaction.create({
      data: { id: randomUUID(), buyerId, listingId, totalAmount, quantity },
    });

    // 7) 포인트 증감 기록
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
    // 구매자 보유 포토카드 추가
    const sourceCard =
      listing.photoCards[0] ||
      (await tx.myPhotoCard.findFirst({
        where: {
          userId: listing.sellerId,
          listing: { some: { id: listingId } },
        },
        select: {
          title: true,
          imgUrl: true,
          watermarkUrl: true,
          grade: true,
          genre: true,
          description: true,
        },
      }));

    if (!sourceCard)
      throw Object.assign(new Error("원본 포토카드 정보를 찾을 수 없습니다."), {
        code: 500,
      });

    const existing = await tx.myPhotoCard.findFirst({
      where: {
        userId: buyerId,
        listing: { some: { id: listingId } },
      },
      select: { id: true },
    });

    if (existing) {
      await tx.myPhotoCard.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      await tx.myPhotoCard.create({
        data: {
          id: randomUUID(),
          userId: buyerId,
          title: sourceCard.title,
          imgUrl: sourceCard.imgUrl,
          watermarkUrl: sourceCard.watermarkUrl,
          grade: sourceCard.grade,
          genre: sourceCard.genre,
          price: 0,
          description: sourceCard.description ?? "",
          quantity,
          listing: { connect: [{ id: listingId }] },
        },
      });
    }
    // 8) 알림 생성
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
          type:
            listingAfter.status === "SOLD_OUT" ? "SOLD_OUT" : "SALE_COMPLETED",
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
  offeredPhotoId,
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
        offeredPhoto: { connect: { id: offeredPhotoId } },
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
// 판매 수정
export async function updateListing({ sellerId, listingId, payload }) {
  // 1) 소유자/상태 검증
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true, status: true },
  });
  if (!listing) {
    const e = new Error("존재하지 않는 판매글입니다.");
    e.code = 404;
    throw e;
  }
  if (listing.sellerId !== sellerId) {
    const e = new Error("본인 판매글만 수정할 수 있습니다.");
    e.code = 403;
    throw e;
  }
  if (["SOLD_OUT", "CANCELLED"].includes(listing.status)) {
    const e = new Error("종료된 판매글은 수정할 수 없습니다.");
    e.code = 400;
    throw e;
  }

  // 2) 수정 수행
  const updated = await prisma.listing.update({
    where: { id: listingId },
    data: {
      ...(payload.price !== undefined ? { price: payload.price } : {}),
      ...(payload.quantity !== undefined ? { quantity: payload.quantity } : {}),
      ...(payload.preferredGrade !== undefined
        ? { preferredGrade: payload.preferredGrade }
        : {}),
      ...(payload.preferredGenre !== undefined
        ? { preferredGenre: payload.preferredGenre }
        : {}),
      ...(payload.preferredDescription !== undefined
        ? { preferredDescription: payload.preferredDescription }
        : {}),
    },
    select: {
      id: true,
      price: true,
      quantity: true,
      status: true,
      preferredGrade: true,
      preferredGenre: true,
      preferredDescription: true,
      updatedAt: true,
    },
  });

  return updated;
}

// 판매 내리기 (판매 취소)
export async function cancelListing({ sellerId, listingId }) {
  return await prisma.$transaction(async (tx) => {
    // 1) 판매글 검증
    const listing = await tx.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        sellerId: true,
        status: true,
        quantity: true,
        myPhotoCardId: true,
      },
    });

    if (!listing) {
      const err = new Error("존재하지 않는 판매글입니다.");
      err.code = 404;
      throw err;
    }

    if (listing.sellerId !== sellerId) {
      const err = new Error("본인 판매글만 취소할 수 있습니다.");
      err.code = 403;
      throw err;
    }

    if (listing.status !== "FOR_SALE" && listing.status !== "FOR_EXCHANGE") {
      const err = new Error("이미 취소되었거나 판매 완료된 글입니다.");
      err.code = 400;
      throw err;
    }

    // 2) 상태 업데이트
    const updated = await tx.listing.updateMany({
      where: { id: listingId, status: { in: ["FOR_SALE", "FOR_EXCHANGE"] } },
      data: { status: "CANCELLED" },
    });
    if (updated.count === 0) {
      const e = new Error("동시에 변경되어 취소할 수 없습니다.");
      e.code = 409;
      throw e;
    }
    const cancelled = await tx.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true, quantity: true, myPhotoCardId: true },
    });

    // 4) 알림 생성
    await tx.notification.create({
      data: {
        id: randomUUID(),
        userId: sellerId,
        type: "LISTING_CANCELLED",
        payload: { listingId: cancelled.id, restoredQty: cancelled.quantity },
      },
    });

    return cancelled;
  });
}
// 판매글 상세조회
export async function findListingById(id) {
  return prisma.listing.findUnique({
    where: { id }, // id는 PK
    select: {
      id: true,
      price: true,
      quantity: true,
      initQuantity: true,
      status: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,

      seller: {
        select: {
          id: true,
          name: true,
        },
      },

      photoCards: {
        select: {
          id: true,
          title: true,
          imgUrl: true,
          watermarkUrl: true,
          grade: true,
          genre: true,
          description: true,
          price: true,
          quantity: true,
        },
      },

      preferredGrade: true,
      preferredGenre: true,
      preferredDescription: true,
    },
  });
}

const DEFAULT_TAKE = 15;

// 마켓플레이스 판매 카드 목록 조회 +검색/필터/정렬
export async function getMarketplaceListings({
  userId,
  search,
  grade,
  genre,
  soldOut,
  sort = "latest",
  cursor,
  take = DEFAULT_TAKE,
}) {
  // take를 숫자로 변환
  const parsedTake = typeof take === 'string' ? parseInt(take, 10) : take;
  const finalTake = isNaN(parsedTake) ? DEFAULT_TAKE : parsedTake;

  const where = {
    sellerId: userId,
    photoCards: {
      some: {
        ...(search && { title: { contains: search, mode: "insensitive" } }),
        ...(grade && { grade }),
        ...(genre && { genre }),
        ...(soldOut !== undefined && { quantity: soldOut ? 0 : { gt: 0 } }),
      },
    },
  };

  let orderBy = {};
  switch (sort) {
    case "low-price":
      orderBy = { price: "asc" };
      break;
    case "high-price":
      orderBy = { price: "desc" };
      break;
    case "latest":
    default:
      orderBy = { createdAt: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
  }

  const listings = await prisma.listing.findMany({
    where,
    include: {
      photoCards: {
        select: {
          id: true,
          title: true,
          grade: true,
          genre: true,
          imgUrl: true,
          watermarkUrl: true,
          description: true,
        },
      },
      seller: { select: { id: true, name: true } },
    },
    orderBy,
    take: finalTake,
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
  sort = "latest",
  cursor,
  take = DEFAULT_TAKE
) {
  // take를 숫자로 변환
  const parsedTake = typeof take === 'string' ? parseInt(take, 10) : take;
  const finalTake = isNaN(parsedTake) ? DEFAULT_TAKE : parsedTake;

  const where = {
    userId,
    ...(search && { title: { contains: search, mode: "insensitive" } }),
    ...(grade && { grade }),
    ...(genre && { genre }),
    ...(soldOut !== undefined && { quantity: soldOut ? 0 : { gt: 0 } }),
  };

  let orderBy = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };

  const photos = await prisma.myPhotoCard.findMany({
    where,
    include: { user: { select: { name: true, id: true } } },
    orderBy,
    take: finalTake,
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
  if (!myPhotoCardId) {
    const error = new Error("myPhotoCardId가 필요합니다.");
    error.status = 400;
    throw error;
  }

  const card = await prisma.myPhotoCard.findUnique({
    where: { id: myPhotoCardId },
  });

  if (!card) {
    const error = new Error("해당 포토카드를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  return prisma.listing.create({
    data: {
      id: randomUUID(),
      photoCards: { connect: [{ id: myPhotoCardId }] },
      seller: { connect: { id: sellerId } },
      price,
      quantity,
      initQuantity: quantity,
      preferredGrade,
      preferredGenre,
      preferredDescription,
      status: "FOR_SALE",
    },
    include: { photoCards: true, seller: true },
  });
}

// 이번 달 등록 수 조회
export async function countListingsThisMonth(sellerId, firstDayOfMonthUTC) {
  return prisma.listing.count({
    where: {
      sellerId,
      createdAt: { gte: firstDayOfMonthUTC },
    },
  });
}
