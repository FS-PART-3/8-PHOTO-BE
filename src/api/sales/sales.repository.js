// 예시파일입니다. 필요시 지우고 사용하세요.
import { prisma } from "../../config/db.js";

/**
 * 판매 카드 필드 선택 정의
 */
const SALES_CARD_SELECT = {
  id: true,
  price: true,
  quantity: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  seller: {
    select: {
      id: true,
      name: true,
    },
  },
  myPhotoCard: {
    select: {
      id: true,
      title: true,
      grade: true,
      genre: true,
      imgUrl: true,
    },
  },
};

/**
 * 포토카드 목록 및 등급별 개수 조회
 * @param {Object} options - 조회 옵션
 * @returns { Promise<object> } - 포토카드 목록 및 등급별 개수 조회 결과
 */
export const findAllSalesCards = async (where, pagination) => {
  // 병렬 쿼리 실행
  const [listings, totalCount, gradeCountsArray] = await Promise.all([
    // 1. 포토카드 목록 조회
    prisma.listing.findMany({
      where,
      select: SALES_CARD_SELECT,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    }),

    // 2. 전체 개수 (필터 적용)
    prisma.listing.count({ where }),

    // 3. 등급별 개수 - MyPhotoCard를 groupBy하되, Listing 조건 반영
    prisma.myPhotoCard.groupBy({
      by: ["grade"],
      where: {
        listings: {
          some: where,
        },
      },
      _count: {
        grade: true,
      },
    }),
  ]);

  const cards = listings.map((listing) => ({
    id: listing.id,
    listingId: listing.id,
    status: listing.status,
    price: listing.price,
    quantity: listing.quantity,
    title: listing.myPhotoCard.title,
    grade: listing.myPhotoCard.grade,
    genre: listing.myPhotoCard.genre,
    imgUrl: listing.myPhotoCard.imgUrl,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    user: listing.seller,
  }));

  return {
    cards,
    totalCount,
    gradeCountsArray,
  };
};
