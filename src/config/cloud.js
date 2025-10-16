import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "./env.js";

export const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: env.AWS_ACCESS_KEY_ID
    ? { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY }
    : undefined,
});

export async function uploadBufferToS3({ buffer, key, contentType }) {
  const input = {
    Bucket: env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType || "application/octet-stream",
    ACL: "public-read",
  };
  await s3.send(new PutObjectCommand(input));
  return `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function deleteFromS3(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
}
