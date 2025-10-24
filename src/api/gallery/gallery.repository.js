import { prisma } from "../../config/db.js";
import { randomUUID } from "crypto";

// 마이갤러리 포토카드 조회
export async function getMyPhotoCards(userId, params) {
  const { page = 0, size = 12, search, grade, genre, sortBy = "createdAt", sortOrder = "desc" } = params;

  const where = {
    userId,
    isDeleted: false,
  };

  // 검색 조건 추가
  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  // 등급 필터
  if (grade) {
    where.grade = grade;
  }

  // 장르 필터
  if (genre) {
    where.genre = genre;
  }

  // 정렬 조건
  const orderBy = {
    [sortBy]: sortOrder,
  };

  // 판매중인 수량 계산을 위한 서브쿼리
  const myPhotoCards = await prisma.myPhotoCard.findMany({
    where,
    include: {
      listings: {
        where: {
          status: {
            in: ["FOR_SALE", "FOR_EXCHANGE"],
          },
          isDeleted: false,
        },
        select: {
          quantity: true,
        },
      },
    },
    orderBy,
    skip: page * size,
    take: size,
  });

  // 전체 개수 조회
  const total = await prisma.myPhotoCard.count({ where });

  // 판매중인 수량을 제외한 실제 보유 수량 계산
  const result = myPhotoCards.map((card) => {
    const soldQuantity = card.listings.reduce(
      (sum, listing) => sum + listing.quantity,
      0
    );
    const availableQuantity = card.quantity - soldQuantity;

    // listings 제거 후 반환
    const { listings, ...cardWithoutListings } = card;
    
    return {
      ...cardWithoutListings,
      availableQuantity, // 마이갤러리에 표시될 실제 보유 수량
      soldQuantity, // 판매 중인 수량
    };
  }).filter(card => card.availableQuantity > 0); // 보유 수량이 0보다 큰 것만 반환

  return {
    data: result,
    pagination: {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
    },
  };
}

// 포토카드 생성
export async function createPhotoCard(userId, photoCardData, imgUrl) {
  const { title, grade, genre, price, quantity, description } = photoCardData;

  const myPhotoCard = await prisma.myPhotoCard.create({
    data: {
      id: randomUUID(),
      userId,
      title,
      grade,
      genre,
      price,
      quantity,
      imgUrl,
      description,
    },
  });

  // 히스토리 기록
  await prisma.history.create({
    data: {
      id: randomUUID(),
      userId,
      action: "CREATE_PHOTO_CARD",
      description: `[${grade} | ${title}] 포토카드를 생성했습니다.`,
      entityType: "MY_PHOTO_CARD",
      entityId: myPhotoCard.id,
      newData: myPhotoCard,
    },
  });

  return myPhotoCard;
}
