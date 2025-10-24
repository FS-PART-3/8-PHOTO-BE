import * as repo from "./gallery.repository.js";
import { uploadBufferToS3 } from "../../config/cloud.js";
import { randomUUID } from "crypto";

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

  // 포토카드 생성
  const myPhotoCard = await repo.createPhotoCard(userId, photoCardData, imgUrl);

  return {
    success: true,
    message: `[${myPhotoCard.grade} | ${myPhotoCard.title}] 포토카드 생성에 성공했습니다!`,
    data: {
      myphoto_id: myPhotoCard.id,
      user_id: myPhotoCard.userId,
      title: myPhotoCard.title,
      grade: myPhotoCard.grade,
      genre: myPhotoCard.genre,
      price: myPhotoCard.price,
      quantity: myPhotoCard.quantity,
      imgUrl: myPhotoCard.imgUrl,
      description: myPhotoCard.description,
    },
  };
}
