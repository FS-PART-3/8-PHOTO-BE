// src/services/photocardService.js
import * as salesRepository from "./sales.repository.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 15;

/**
 * 쿼리 파라미터를 Prisma where 객체로 변환하는 헬퍼 함수
 * @param {object} filters - Controller에서 받은 필터 객체 { search, grade, status, genre, soldOut }
 * @returns {object} Prisma where 객체 (Listing 모델 기반)
 */
const buildWhereClause = (filters) => {
  const where = {};
  const myPhotoCardFilters = {};
  const { search, grade, genre, status, soldOut } = filters;

  // 1. 검색어 (search) 처리: myPhotoCard의 title 필드에 대해 부분 일치 검색
  if (search) {
    myPhotoCardFilters.title = { contains: search, mode: "insensitive" };
  }

  // 2. 등급 (grade) 처리: myPhotoCard의 grade 필드 필터링
  if (grade) {
    myPhotoCardFilters.grade = grade.toUpperCase();
  }

  // 3. 장르 (genre) 처리: myPhotoCard의 genre 필드 필터링
  if (genre) {
    myPhotoCardFilters.genre = genre;
  }

  // myPhotoCard 필터가 있으면 where 절에 추가
  if (Object.keys(myPhotoCardFilters).length > 0) {
    where.myPhotoCard = myPhotoCardFilters;
  }

  // 4. 상태 (status) 처리: Listing의 status 필드 필터링
  if (status) {
    where.status = status.toUpperCase();
  }

  // 5. 품절 여부 (soldOut) 처리: quantity가 0인지 확인
  if (soldOut !== undefined) {
    const isSoldOut = soldOut === "true" || soldOut === true;
    where.quantity = isSoldOut ? 0 : { gt: 0 };
  }

  return where;
};

const getPaginationOptions = (page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) => {
  const numPage = Number(page) || DEFAULT_PAGE;
  const numLimit = Number(limit) || DEFAULT_LIMIT;
  const skip = (numPage - 1) * numLimit;
  const take = numLimit;
  return { skip, take };
};

/**
 * 등급별 개수 계산
 * @param {Array} gradeCountsArray - 등급별 개수 배열
 * @returns {Object} - 등급별 개수 객체
 */
const formatGradeCounts = (gradeCountsArray) => {
  const gradeCounts = {
    COMMON: 0,
    RARE: 0,
    SUPERRARE: 0,
    LEGENDARY: 0,
  };

  gradeCountsArray.forEach((item) => {
    gradeCounts[item.grade] = item._count.grade;
  });

  return gradeCounts;
};

/**
 * '나의 판매 포토카드' 페이지에 필요한 데이터를 조회하는 서비스 함수
 * @param {string} userId - 현재 로그인한 사용자 ID
 * @param {object} filters - Controller에서 받은 필터 객체
 * @param {number} [page=1] - 페이지 번호
 * @param {number} [limit=10] - 페이지당 항목 수
 * @returns { Promise<object> }
 */
export const getMySalesPhotocards = async (
  userId,
  filters,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT
) => {
  // 쿼리 파라미터 기반의 WHERE 절 생성
  const filterWhere = buildWhereClause(filters);

  // Listing 모델 기반의 WHERE 절 구성
  const whereClause = {
    sellerId: userId, // Listing 모델의 sellerId 필드 사용
    ...filterWhere,
  };

  const pagination = getPaginationOptions(page, limit);
  const { cards, totalCount, gradeCountsArray } =
    await salesRepository.findAllSalesCards(whereClause, pagination);

  const gradeCounts = formatGradeCounts(gradeCountsArray);

  return {
    cards,
    countsGroup: {
      totalCounts: totalCount,
      gradeCounts,
    },
  };
};
