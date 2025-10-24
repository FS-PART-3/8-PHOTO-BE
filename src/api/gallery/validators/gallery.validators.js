import { z } from "zod";

// 마이갤러리 조회 스키마
export const getMyGallerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(0).optional().default(0),
    size: z.coerce.number().int().min(1).max(50).optional().default(12),
    search: z.string().optional(),
    grade: z.enum(["COMMON", "RARE", "SUPERRARE", "LEGENDARY"]).optional(),
    genre: z.enum(["풍경", "인물", "도시", "자연"]).optional(),
    sortBy: z.enum(["createdAt", "grade", "price"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

// 포토카드 생성 스키마
export const createPhotoCardSchema = z.object({
  body: z.object({
    title: z.string().min(1, "제목은 필수입니다.").max(100),
    grade: z.enum(["COMMON", "RARE", "SUPERRARE", "LEGENDARY"], {
      required_error: "등급은 필수입니다.",
    }),
    genre: z.enum(["풍경", "인물", "도시", "자연"], {
      required_error: "장르는 필수입니다.",
    }),
    price: z.coerce.number().int().min(0, "가격은 0 이상이어야 합니다."),
    quantity: z.coerce.number().int().min(1, "수량은 1 이상이어야 합니다."),
    description: z.string().max(1000).optional().default(""),
    userId: z.string().optional(), // authGuard 미적용시 테스트용
  }),
});
