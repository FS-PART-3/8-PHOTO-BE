import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/authGuard.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  purchaseSchema,
  createExchangeSchema,
  updateListingSchema,
  createListingSchema,
} from "./validators/products.validators.js";
import * as controller from "./products.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Marketplace
 *   description: 마켓플레이스 API
 */

router.post(
  "/marketplace/:listingId/purchase",
  verifyAccessToken,
  validate(purchaseSchema),
  controller.purchase
);

// 교환 신청 생성
router.post(
  "/marketplace/:listingId/exchanges",
  verifyAccessToken,
  validate(createExchangeSchema),
  controller.createExchangeOffer
);
// 판매 수정
router.patch(
  "/marketplace/:listingId",
  verifyAccessToken,
  validate(updateListingSchema),
  controller.updateListing
);

// 판매 내리기 (판매 취소)
router.patch(
  "/marketplace/:listingId/cancel",
  verifyAccessToken,
  controller.cancelListing
);

/**
 * @swagger
 * /marketplace:
 *   get:
 *     summary: 마켓플레이스 판매 카드 목록 조회
 *     description: 검색, 필터, 정렬, 페이지네이션(cursor 기반) 기능을 제공합니다.
 *     tags: [Marketplace]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: 특정 판매자 ID로 필터링
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 포토카드 제목 검색
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *         description: 포토카드 등급 필터
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: 포토카드 장르 필터
 *       - in: query
 *         name: soldOut
 *         schema:
 *           type: boolean
 *         description: 품절 여부 필터 (true일 경우 품절 상품만)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, createdAt, quantity]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: 페이지네이션 커서
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           default: 15
 *         description: 한 번에 가져올 데이터 수
 *     responses:
 *       200:
 *         description: 성공적으로 판매 카드 목록을 반환함
 *       500:
 *         description: 서버 오류
 */
router.get("/marketplace", controller.getMarketplaceListings);

/**
 * @swagger
 * /marketplace/my-photo-cards:
 *   get:
 *     summary: 내 포토카드 목록 조회
 *     tags: [Marketplace]
 *     description: 사용자 ID 기준으로 내 포토카드 목록을 검색, 필터, 정렬, 페이지네이션 옵션과 함께 조회합니다.
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *       - in: query
 *         name: soldOut
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           default: 6
 *     responses:
 *       200:
 *         description: 내 포토카드 목록 반환
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
router.get("/marketplace/my-photo-cards", controller.getMyPhotoCards);

/**
 * @swagger
 * /marketplace/my-photo-cards/{myPhotoCardId}:
 *   get:
 *     summary: 포토카드 상세 조회
 *     tags: [Marketplace]
 *     parameters:
 *       - in: path
 *         name: myPhotoCardId
 *         required: true
 *         schema:
 *           type: string
 *         description: 포토카드 ID
 *     responses:
 *       200:
 *         description: 포토카드 상세 정보 반환
 *       404:
 *         description: 포토카드를 찾을 수 없음
 */
router.get(
  "/marketplace/my-photo-cards/:myPhotoCardId",
  controller.getMyPhotoCardById
);

/**
 * @swagger
 * /marketplace/listings:
 *   post:
 *     summary: 판매 등록
 *     tags: [Marketplace]
 *     description: 내 포토카드를 마켓플레이스에 판매 등록합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - myPhotoCardId
 *               - price
 *               - quantity
 *               - sellerId
 *             properties:
 *               myPhotoCardId:
 *                 type: string
 *                 description: 판매할 포토카드 ID
 *               price:
 *                 type: number
 *                 description: 판매 가격
 *               quantity:
 *                 type: integer
 *                 description: 판매 수량
 *               sellerId:
 *                 type: string
 *                 description: 판매자 ID (인증 토큰이 없을 경우 명시 필요)
 *               preferredGrade:
 *                 type: string
 *                 nullable: true
 *                 description: 선호 등급
 *               preferredGenre:
 *                 type: string
 *                 nullable: true
 *                 description: 선호 장르
 *               preferredDescription:
 *                 type: string
 *                 nullable: true
 *                 description: 추가 설명
 *     responses:
 *       201:
 *         description: 판매 등록 완료
 *       400:
 *         description: 월 최대 3건 제한 초과 또는 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
router.post(
  "/marketplace/listings",
  verifyAccessToken,
  validate(createListingSchema),
  controller.createListing
);

export default router;
