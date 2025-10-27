import { prisma } from "../../config/db.js";
import { randomUUID } from "crypto";
export async function runApproveExchangeOfferTransaction({ sellerId, offerId }) {
  return await prisma.$transaction(async (tx) => {
    // 1) 교환 신청 조회
    const offer = await tx.exchangeOffer.findUnique({
      where: { id: offerId },
      select: { id: true, listingId: true, offeredById: true, status: true },
    });
    if (!offer) throw Object.assign(new Error("존재하지 않는 교환 신청입니다."), { code: 404 });
    if (offer.status !== "PENDING")
      throw Object.assign(new Error("이미 처리된 교환 신청입니다."), { code: 400 });

    // 2) 판매글 조회 + 권한 확인
    const listing = await tx.listing.findUnique({
      where: { id: offer.listingId },
      select: {
        id: true,
        sellerId: true,
        status: true,
        quantity: true,
        photoCards: {
          select: {
            id: true,
            userId: true,
            title: true,
            imgUrl: true,
            grade: true,
            genre: true,
            description: true,
            price: true,
            quantity: true,
          },
        },
      },
    });
    if (!listing) throw Object.assign(new Error("관련 판매글이 존재하지 않습니다."), { code: 404 });
    if (listing.sellerId !== sellerId)
      throw Object.assign(new Error("해당 판매글의 판매자만 승인할 수 있습니다."), { code: 403 });
    if (["CANCELLED", "SOLD_OUT"].includes(listing.status))
      throw Object.assign(new Error("이미 종료된 판매글입니다."), { code: 400 });

    const sourceCard = listing.photoCards[0];
    if (!sourceCard)
      throw Object.assign(new Error("판매글에 연결된 원본 포토카드가 없습니다."), { code: 500 });
    if (sourceCard.userId !== listing.sellerId)
      throw Object.assign(new Error("판매자 소유의 포토카드가 아닙니다."), { code: 400 });
    if (sourceCard.quantity <= 0)
      throw Object.assign(new Error("판매자의 보유 수량이 부족합니다."), { code: 400 });
    // 3) 교환 신청 승인
    const offerAfter = await tx.exchangeOffer.update({
      where: { id: offer.id },
      data: { status: "ACCEPTED" },
      select: { id: true, listingId: true, status: true },
    });

    // 4) 판매자 마이포토카드 수량 차감
    const decSeller = await tx.myPhotoCard.updateMany({
      where: { id: sourceCard.id, quantity: { gte: 1 } },
      data: { quantity: { decrement: 1 } },
    });
    if (decSeller.count === 0) {
      throw Object.assign(new Error("판매자의 보유 수량이 부족합니다."), { code: 400 });
    }
    // 5) 구매자 마이포토카드 수량 증가 or 생성
    const baseWhere = {
      userId: offer.offeredById,
      title: sourceCard.title,
      grade: sourceCard.grade,
      genre: sourceCard.genre,
      imgUrl: sourceCard.imgUrl,
    };

    const existingBuyerCard = await tx.myPhotoCard.findFirst({
      where: baseWhere,
      select: { id: true },
    });

    if (existingBuyerCard) {
      await tx.myPhotoCard.update({
        where: { id: existingBuyerCard.id },
        data: { quantity: { increment: 1 } },
      });
    } else {
      await tx.myPhotoCard.create({
        data: {
          id: crypto.randomUUID(),
          userId: offer.offeredById,
          title: sourceCard.title,
          imgUrl: sourceCard.imgUrl,
          grade: sourceCard.grade,
          genre: sourceCard.genre,
          price: sourceCard.price ?? 0,
          quantity: 1,
          description: sourceCard.description ?? "",
        },
      });
    }
    // 6) 판매글 상태 및 수량 업데이트
    const decListing = await tx.listing.updateMany({
      where: { id: listing.id, quantity: { gte: 1 } },
      data: { quantity: { decrement: 1 } },
    });
    if (decListing.count === 0) {
      throw Object.assign(new Error("이미 재고가 소진되었습니다."), { code: 400 });
    }
    const listingAfterQty = await tx.listing.findUnique({
      where: { id: listing.id },
      select: { id: true, status: true, quantity: true },
    });
    if (!listingAfterQty) throw Object.assign(new Error("판매글 조회 오류"), { code: 500 });

    let listingAfter = listingAfterQty;
    if (listingAfterQty.quantity <= 0 && listingAfterQty.status !== "SOLD_OUT") {
      listingAfter = await tx.listing.update({
        where: { id: listing.id },
        data: { status: "SOLD_OUT" },
        select: { id: true, status: true, quantity: true },
      });
    }
    // 7) 알림 생성
    await tx.notification.create({
      data: {
        id: crypto.randomUUID(),
        userId: offer.offeredById, // 교환 신청자에게 알림
        type: "EXCHANGE_ACCEPTED",
        payload: { listingId: listing.id, offerId: offer.id },
      },
    });

    // 8) 동일 판매글의 재고가 없을경우 나머지 PENDING 오퍼는 자동 거절
    if (listingAfter.quantity <= 0) {
      await tx.exchangeOffer.updateMany({
        where: { listingId: listing.id, status: "PENDING" },
        data: { status: "REJECTED" },
      });
    }
    return { offerAfter, listingAfter };
  });
}
