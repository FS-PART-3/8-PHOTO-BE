import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "./env.js";

// ============ 기존 S3 코드 (주석 처리) ============
// export const s3 = new S3Client({
//   region: env.AWS_REGION,
//   credentials: env.AWS_ACCESS_KEY_ID
//     ? { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY }
//     : undefined,
// });

// export async function uploadBufferToS3({ buffer, key, contentType }) {
//   const input = {
//     Bucket: env.S3_BUCKET,
//     Key: key,
//     Body: buffer,
//     ContentType: contentType || "application/octet-stream",
//     ACL: "public-read",
//   };
//   await s3.send(new PutObjectCommand(input));
//   return `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
// }

// export async function deleteFromS3(key) {
//   await s3.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
// }
// =================================================

// ============ 임시: 로컬 파일 저장 코드 (AWS 배포 후 삭제) ============

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const s3 = null; // S3 미사용

export async function uploadBufferToS3({ buffer, key, contentType }) {
  const uploadsDir = path.join(__dirname, "../../uploads");
  const filePath = path.join(uploadsDir, key);
  const fileDir = path.dirname(filePath);

  // 디렉토리가 없으면 생성
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true });
  }

  // 파일 저장
  fs.writeFileSync(filePath, buffer);

  // 로컬 URL 반환
  return `${env.BASE_URL || "http://localhost:4000"}/uploads/${key}`;
}

export async function deleteFromS3(key) {
  const uploadsDir = path.join(__dirname, "../../uploads");
  const filePath = path.join(uploadsDir, key);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
// ====================================================================
