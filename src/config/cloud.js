import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "./env.js";

// S3 클라이언트 초기화
export const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: env.AWS_ACCESS_KEY_ID
    ? { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY }
    : undefined,
});

/**
 * S3에 버퍼를 업로드하고 public URL 반환
 */
export async function uploadBufferToS3({ buffer, key, contentType }) {
  const input = {
    Bucket: env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType || "application/octet-stream",
  };
  await s3.send(new PutObjectCommand(input));
  return `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

/**
 * S3에서 파일 삭제
 */
export async function deleteFromS3(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
}
