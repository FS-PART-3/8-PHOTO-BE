import { z } from "zod";

// Grade enum 정의 (스키마와 일치)
const GradeEnum = z.enum(["COMMON", "RARE", "SUPER_RARE", "LEGENDARY"]);

const GenreEnum = z.enum(["풍경", "인물", "도시", "자연"]);

// ListingStatus enum 정의 (스키마와 일치)
const ListingStatusEnum = z.enum([
  "FOR_SALE",
  "FOR_EXCHANGE",
  "SOLD_OUT",
  "CANCELLED",
]);

/**
 * GET /my-photo-cards/sales 쿼리 파라미터 검증
 */
export const getMySalesSchema = z.object({
  query: z.object({
    // 검색어
    search: z.string().max(100).optional(),

    // 등급 필터 (대소문자 무관하게 받고 변환)
    grade: z
      .string()
      .transform((val) => val.toUpperCase().replace("SUPERRARE", "SUPER_RARE"))
      .pipe(GradeEnum)
      .optional(),

    // 장르 필터
    genre: GenreEnum.optional(),

    // 상태 필터
    status: z
      .string()
      .transform((val) => val.toUpperCase())
      .pipe(ListingStatusEnum)
      .optional(),

    // 품절 여부 필터
    soldOut: z
      .string()
      .transform((val) => val === "true" || val === "1")
      .optional()
      .or(z.boolean().optional()),

    // 페이지네이션
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});
