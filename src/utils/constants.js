// 포토카드 관련 상수
export const PHOTO_CARD = {
  MAX_MONTHLY_CREATIONS: 3, // 한 달 최대 생성 가능 횟수
  CREATION_FEE_RATE: 0.1, // 생성 수수료 비율 (10%)
};

// 페이지네이션 기본값
export const PAGINATION = {
  // 갤러리 페이지네이션
  GALLERY_DEFAULT_PAGE: 0,
  GALLERY_DEFAULT_SIZE: 12,
};

// 등급 - DB 값
export const GRADE = {
  COMMON: "COMMON",
  RARE: "RARE",
  SUPER_RARE: "SUPER_RARE",
  LEGENDARY: "LEGENDARY",
};
export const GRADE_VALUES = Object.values(GRADE);

// 등급 - 표시 값
export const GRADE_DISPLAY = {
  COMMON: "COMMON",
  RARE: "RARE",
  SUPER_RARE: "SUPERRARE",
  LEGENDARY: "LEGENDARY",
};
export const GRADE_DISPLAY_VALUES = Object.values(GRADE_DISPLAY);

// 장르
export const GENRE = {
  LANDSCAPE: "풍경",
  PORTRAIT: "인물",
  CITY: "도시",
  NATURE: "자연",
};
export const GENRE_VALUES = Object.values(GENRE);

// 정렬 순서
export const SORT_ORDER = {
  ASC: "asc",
  DESC: "desc",
};
export const SORT_ORDER_VALUES = Object.values(SORT_ORDER);

// 갤러리 정렬 기준
export const GALLERY_SORT_BY = {
  CREATED_AT: "createdAt",
  TITLE: "title",
  GRADE: "grade",
  PRICE: "price",
};
export const SORT_BY_VALUES = Object.values(GALLERY_SORT_BY);
