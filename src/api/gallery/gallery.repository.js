import { prisma } from "../../config/db.js";
import { randomUUID } from "crypto";
import dayjs from "dayjs";
import { PAGINATION, GALLERY_SORT_BY, SORT_ORDER } from "../../utils/constants.js";

// 마이갤러리 포토카드 조회
export async function getMyPhotoCards(userId, params) {
  const { 
    page = PAGINATION.GALLERY_DEFAULT_PAGE, 
    size = PAGINATION.GALLERY_DEFAULT_SIZE, 
    search, 
    grade, 
    genre, 
    sortBy = GALLERY_SORT_BY.CREATED_AT, 
    sortOrder = SORT_ORDER.DESC 
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

  // 등급별 개수 조회
  const gradeCountsArray = await prisma.myPhotoCard.groupBy({
    by: ["grade"],
    where,
    _count: {
      grade: true,
    },
  });

  return {
    data: myPhotoCards,
    pagination: {
      page: pageNum,
      size: sizeNum,
      total,
      totalPages: Math.ceil(total / sizeNum),
    },
    gradeCountsArray,
  };
}

// 이번 달 포토카드 생성 횟수 조회
export async function getMonthlyCreationCount(userId) {
  const now = dayjs();
  const startOfMonth = now.startOf("month").toDate();
  const endOfMonth = now.endOf("month").toDate();

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

  return createCount;
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
