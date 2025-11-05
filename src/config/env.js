// 환경변수 로딩 + Zod 검증
import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().optional(),
  CORS_ORIGIN: z.string().default("*"),
  JWT_SECRET: z.string().min(10, "JWT_SECRET is required (>=10 chars)"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_JWT_ACCESS_EXPIRES_IN: z.string().default("7d"),
  JWT_JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  // DB
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  // AWS S3
  AWS_REGION: z.string().min(1, "AWS_REGION is required"),
  AWS_ACCESS_KEY_ID: z.string().min(1, "AWS_ACCESS_KEY_ID is required"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, "AWS_SECRET_ACCESS_KEY is required"),
  S3_BUCKET: z.string().min(1, "S3_BUCKET is required"),
});

export const env = schema.parse(process.env);
