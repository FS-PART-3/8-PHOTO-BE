import * as repo from "./gallery.repository.js";
import { uploadBufferToS3 } from "../../config/cloud.js";
import { randomUUID } from "crypto";
import { prisma } from "../../config/db.js";
import { PHOTO_CARD } from "../../utils/constants.js";

// 마이갤러리 포토카드 조회
export async function getMyGalleryService(userId, params) {
  const result = await repo.getMyPhotoCards(userId, params);
  
  // 이번 달 생성 기회 정보 추가
  const usedCreations = await repo.getMonthlyCreationCount(userId);
  const remainingCreations = Math.max(0, PHOTO_CARD.MAX_MONTHLY_CREATIONS - usedCreations);
  
  return {
    ...result,
    creationInfo: {
      usedCreations,
      remainingCreations,
      maxCreations: PHOTO_CARD.MAX_MONTHLY_CREATIONS,
    },
  };
}

// 포토카드 생성
export async function createPhotoCardService(userId, photoCardData, file) {
  // 파일이 없으면 에러
  if (!file) {
    const error = new Error("이미지 파일은 필수입니다.");
    error.code = 400;
    throw error;
  }
 
  // 생성 횟수 체크 (한 달에 최대 생성 가능 횟수 확인)
  const createCount = await repo.getMonthlyCreationCount(userId);
  if (createCount >= PHOTO_CARD.MAX_MONTHLY_CREATIONS) {
    const error = new Error(`한 달에 최대 ${PHOTO_CARD.MAX_MONTHLY_CREATIONS}번까지만 포토카드를 생성할 수 있습니다.`);
    error.code = 400;
    throw error;
  }

  // 수수료 계산 (10% 반올림)
  const fee = Math.round(photoCardData.price * PHOTO_CARD.CREATION_FEE_RATE);

  // 유저의 현재 포인트 확인
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      id: true,
      points: {
        select: {
          amount: true,
        },
      },
    },
  });

  if (!user) {
    const error = new Error("사용자를 찾을 수 없습니다.");
    error.code = 404;
    throw error;
  }

  // 포인트 합계 계산
  const currentPoint = user.points.reduce((sum, point) => sum + point.amount, 0);

  if (currentPoint < fee) {
    const error = new Error(
      `포인트가 부족합니다. 필요한 수수료: ${fee}P, 현재 포인트: ${currentPoint}P`
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

    // 포인트 사용 내역 기록 (차감)
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
