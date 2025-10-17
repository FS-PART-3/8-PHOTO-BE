// 환경변수 로딩 + Zod 검증
import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().optional(),
  CORS_ORIGIN: z.string().default("*"),
  JWT_SECRET: z.string().min(10, "JWT_SECRET is required (>=10 chars)"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  // DB
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  // AWS S3
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
});

export const env = schema.parse(process.env);
