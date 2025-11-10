import { z } from "zod";
import {
  GRADE_DISPLAY_VALUES,
  GRADE_VALUES,
  GENRE_VALUES,
  SORT_BY_VALUES,
  SORT_ORDER_VALUES,
  GALLERY_SORT_BY,
  SORT_ORDER,
} from "../../../utils/constants.js";

// 마이갤러리 조회 스키마
export const getMyGallerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(0).optional().default(0),
    size: z.coerce.number().int().min(1).max(50).optional().default(12),
    search: z.string().optional(),
    grade: z.enum(GRADE_DISPLAY_VALUES).optional(),
    genre: z.enum(GENRE_VALUES).optional(),
    sortBy: z.enum(SORT_BY_VALUES).optional().default(GALLERY_SORT_BY.CREATED_AT),
    sortOrder: z.enum(SORT_ORDER_VALUES).optional().default(SORT_ORDER.DESC),
  }),
});

// 포토카드 생성 스키마
export const createPhotoCardSchema = z.object({
  body: z.object({
    title: z.string().min(1, "제목은 필수입니다.").max(100),
    grade: z.enum(GRADE_VALUES, {
      required_error: "등급은 필수입니다.",
    }),
    genre: z.enum(GENRE_VALUES, {
      required_error: "장르는 필수입니다.",
    }),
    price: z.coerce.number().int().min(0, "가격은 0 이상이어야 합니다."),
    quantity: z.coerce.number().int().min(1, "수량은 1 이상이어야 합니다.").max(10, "한 번에 최대 10장까지 생성 가능합니다."),
    description: z.string().max(1000).optional().default(""),
  }),
  file: z
    .object({
      fieldname: z.string(),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.string().refine(
        (mime) => mime.startsWith("image/"),
        "이미지 파일만 업로드 가능합니다."
      ),
      buffer: z.any(), // Buffer 타입 체크를 완화
      size: z.number().max(5 * 1024 * 1024, "파일 크기는 5MB 이하여야 합니다."),
    })
    .refine((file) => file && file.buffer, {
      message: "이미지 파일은 필수입니다.",
    }),
});
