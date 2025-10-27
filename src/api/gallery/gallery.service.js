import * as repo from "./gallery.repository.js";
import { uploadBufferToS3 } from "../../config/cloud.js";
import { randomUUID } from "crypto";
import { prisma } from "../../config/db.js";

// 마이갤러리 포토카드 조회
export async function getMyGalleryService(userId, params) {
  const result = await repo.getMyPhotoCards(userId, params);
  return result;
}

// 포토카드 생성
export async function createPhotoCardService(userId, photoCardData, file) {
  // 파일이 없으면 에러
  if (!file) {
    const error = new Error("이미지 파일은 필수입니다.");
    error.code = 400;
    throw error;
  }

  // 수수료 계산 (10% 반올림)
  const fee = Math.round(photoCardData.price * 0.1);

  // 유저의 현재 포인트 확인
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { point: true },
  });

  if (!user) {
    const error = new Error("사용자를 찾을 수 없습니다.");
    error.code = 404;
    throw error;
  }

  if (user.point < fee) {
    const error = new Error(
      `포인트가 부족합니다. 필요한 수수료: ${fee}P, 현재 포인트: ${user.point}P`
    );
    error.code = 400;
    throw error;
  }

  // S3에 이미지 업로드
  let imgUrl;
  try {
    const fileExtension = file.originalname.split(".").pop();
    const key = `photo-cards/${randomUUID()}.${fileExtension}`;
    imgUrl = await uploadBufferToS3({
      buffer: file.buffer,
      key,
      contentType: file.mimetype,
    });
  } catch (error) {
    const err = new Error("이미지 업로드에 실패했습니다.");
    err.code = 500;
    throw err;
  }

  // 포토카드 생성 및 포인트 차감을 트랜잭션으로 처리
  const result = await prisma.$transaction(async (tx) => {
    // 포토카드 생성
    const myPhotoCard = await repo.createPhotoCard(userId, photoCardData, imgUrl);

    // 포인트 차감
    await tx.user.update({
      where: { id: userId },
      data: { point: { decrement: fee } },
    });

    // 포인트 사용 내역 기록
    await tx.point.create({
      data: {
        id: randomUUID(),
        userId,
        amount: -fee,
        reason: "PURCHASE",
      },
    });

    return myPhotoCard;
  });

  return {
    success: true,
    message: `[${result.grade} | ${result.title}] 포토카드 생성에 성공했습니다! (수수료: ${fee}P 차감)`,
    data: {
      myphoto_id: result.id,
      user_id: result.userId,
      title: result.title,
      grade: result.grade,
      genre: result.genre,
      price: result.price,
      quantity: result.quantity,
      imgUrl: result.imgUrl,
      description: result.description,
      fee,
    },
  };
}
