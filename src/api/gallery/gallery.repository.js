import { prisma } from "../../config/db.js";
import { randomUUID } from "crypto";
import dayjs from "dayjs";

// 마이갤러리 포토카드 조회
export async function getMyPhotoCards(userId, params) {
  const { 
    page = 0, 
    size = 12, 
    search, 
    grade, 
    genre, 
    sortBy = "createdAt", 
    sortOrder = "desc" 
  } = params;

  // 숫자로 명시적 변환
  const pageNum = Number(page);
  const sizeNum = Number(size);

  const where = {
    userId,
    isDeleted: false,
    quantity: {
      gte: 1,
    },
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

  // 포토카드 조회
  const myPhotoCards = await prisma.myPhotoCard.findMany({
    where,
    orderBy,
    skip: pageNum * sizeNum,
    take: sizeNum,
  });

  // 전체 개수 조회
  const total = await prisma.myPhotoCard.count({ where });

  return {
    data: myPhotoCards,
    pagination: {
      page: pageNum,
      size: sizeNum,
      total,
      totalPages: Math.ceil(total / sizeNum),
    },
  };
}

// 포토카드 생성
export async function createPhotoCard(userId, photoCardData, imgUrl) {
  const { title, grade, genre, price, quantity, description } = photoCardData;

  // 한 달에 3번만 생성 가능한지 확인
  const now = dayjs();
  const startOfMonth = now.startOf("month").toDate();
  const endOfMonth = now.endOf("month").toDate();

  // 이번 달에 생성한 포토카드 개수 조회 (히스토리 테이블에서 CREATE_PHOTO_CARD 액션 카운트)
  const createCount = await prisma.history.count({
    where: {
      userId,
      action: "CREATE_PHOTO_CARD",
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  if (createCount >= 3) {
    const error = new Error("한 달에 최대 3번까지만 포토카드를 생성할 수 있습니다.");
    error.code = 400;
    throw error;
  }

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
