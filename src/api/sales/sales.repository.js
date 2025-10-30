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
  photoCards: {
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
 * @param {Object} where - Prisma where 절
 * @param {Object} pagination - 페이지네이션 옵션
 * @returns { Promise<object> } - 포토카드 목록 및 등급별 개수 조회 결과
 */
export const findAllSalesCards = async (where, pagination) => {
  // MyPhotoCard 필터 조건 추출 (sellerId는 제외)
  const myPhotoCardWhere = where.photoCards?.some || {};

  // sellerId 기반 where 절 생성
  const listingWhere = {
    sellerId: where.sellerId,
    isDeleted: false,
  };

  // Listing 자체의 필터 조건 추가
  if (where.status) {
    listingWhere.status = where.status;
  }
  if (where.quantity !== undefined) {
    listingWhere.quantity = where.quantity;
  }

  // photoCards 관계 필터가 있으면 추가
  if (Object.keys(myPhotoCardWhere).length > 0) {
    listingWhere.photoCards = { some: myPhotoCardWhere };
  }

  // 병렬 쿼리 실행
  const [listings, totalCount, gradeCountsArray] = await Promise.all([
    // 1. 포토카드 목록 조회
    prisma.listing.findMany({
      where: listingWhere,
      select: SALES_CARD_SELECT,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    }),

    // 2. 전체 개수 (필터 적용)
    prisma.listing.count({ where: listingWhere }),

    // 3. 등급별 개수 - MyPhotoCard를 groupBy하되, Listing 조건 반영
    prisma.myPhotoCard.groupBy({
      by: ["grade"],
      where: {
        isDeleted: false,
        listing: {
          some: listingWhere,
        },
      },
      _count: {
        grade: true,
      },
    }),
  ]);

  const cards = listings.map((listing) => ({
    id: listing.id,
    status: listing.status,
    price: listing.price,
    quantity: listing.quantity,
    title: listing.photoCards[0]?.title,
    grade: listing.photoCards[0]?.grade,
    genre: listing.photoCards[0]?.genre,
    imgUrl: listing.photoCards[0]?.imgUrl,
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
