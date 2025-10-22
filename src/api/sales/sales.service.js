// src/services/photocardService.js
import * as salesRepository from "./sales.repository.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 15;

/**
 * 쿼리 파라미터를 Prisma where 객체로 변환하는 헬퍼 함수
 * @param {object} filters - Controller에서 받은 필터 객체 { search, grade, status, genre }
 * @returns {object} Prisma where 객체
 */
const buildWhereClause = (filters) => {
  const where = {};
  const { search, grade, genre } = filters;

  // 1. 검색어 (search) 처리: title 필드에 대해 부분 일치 검색
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  // 2. 등급 (grade) 처리: ENUM 값 필터링
  if (grade) {
    where.grade = grade.toUpperCase();
  }

  // 3. 장르 (genre) 처리
  if (genre) {
    where.genre = genre;
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
  const whereClause = {
    userId: userId,
    isDeleted: false,
    ...(filterWhere || {}),
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
