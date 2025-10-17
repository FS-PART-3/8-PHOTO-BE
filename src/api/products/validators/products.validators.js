// 예시 코드입니다. 필요시 지우고 사용하세요.

// import { z } from "zod";

// export const listSchema = z.object({
//   query: z.object({
//     page: z.coerce.number().int().min(0).default(0).optional(),
//     size: z.coerce.number().int().min(1).max(100).default(12).optional(),
//     orderBy: z.enum(["recent", "favorite"]).default("recent").optional(),
//     keyword: z.string().max(100).optional().default(""),
//   }),
//   params: z.object({}).optional(),
//   body: z.object({}).optional(),
// });

// export const detailSchema = z.object({
//   params: z.object({
//     productId: z.string().min(1),
//   }),
//   query: z.object({}).optional(),
//   body: z.object({}).optional(),
// });

// export const createSchema = z.object({
//   body: z.object({
//     title: z.string().min(1).max(100),
//     description: z.string().max(2000).optional(),
//     price: z.number().int().nonnegative(),
//     // 이미지 URL은 S3 업로드 후 별도 필드로
//     imageUrl: z.string().url().optional(),
//     // 발행량/상태 등 도메인 필드 추가 가능
//   }),
//   params: z.object({}).optional(),
//   query: z.object({}).optional(),
// });
