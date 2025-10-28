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

/**
 * @swagger
 * /marketplace/{listingId}/purchase:
 *   post:
 *     summary: 포토카드 구매
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *     responses:
 *       201:
 *         description: 구매 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "구매가 완료되었습니다." }
 *                 transactionId: { type: string, example: "a2636ac4-..." }
 *                 totalAmount: { type: integer, example: 500 }
 *       400:
 *         description: 잘못된 요청 (본인 판매글 / 구매 불가 상태 / 포인트 부족 등)
 *       401:
 *         description: 인증 실패 (토큰 누락/만료)
 *       404:
 *         description: 존재하지 않는 판매글
 *       409:
 *         description: 동시성/재고 충돌 (판매자 보유 수량 부족, 동시 변경 등)
 *       500:
 *         description: 서버 내부 오류 (원본 포토카드 조회 실패 등)
 */
router.post(
  "/marketplace/:listingId/purchase",
  verifyAccessToken,
  validate(purchaseSchema),
  controller.purchase,
);
/**
 * @swagger
 * /marketplace/{listingId}/exchanges:
 *   post:
 *     summary: 교환 신청 생성
 *     description: 특정 판매글에 대해 교환 신청을 생성합니다.
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         description: 교환 신청 대상 판매글 ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: 교환 희망 수량
 *                 minimum: 1
 *                 example: 1
 *               offeredDescription:
 *                 type: string
 *                 description: 교환 제안 상세 설명(제안 카드/조건 등)
 *                 example: 제 포토카드 A(RARE) 1장과 교환 원해요.
 *     responses:
 *       201:
 *         description: 교환 신청 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, example: 1c5b7e4e-e9b8-4b8e-bd39-2a9c3b7b1a91 }
 *                 listingId: { type: string, example: listing-123 }
 *                 status: { type: string, example: PENDING }
 *                 offeredById: { type: string, example: user-456 }
 *                 createdAt: { type: string, example: 2025-10-28T05:20:00.000Z }
 *       400:
 *         description: 잘못된 요청 (유효성 오류 등)
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 존재하지 않는 판매글
 *       409:
 *         description: 동시성/상태 충돌
 */
// 교환 신청 생성
router.post(
  "/marketplace/:listingId/exchanges",
  verifyAccessToken,
  validate(createExchangeSchema),
  controller.createExchangeOffer,
);
/**
 * @swagger
 * /marketplace/{listingId}:
 *   patch:
 *     summary: 판매글 수정
 *     description: 가격/수량/선호 조건 등을 수정합니다.
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         description: 수정할 판매글 ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: integer
 *                 minimum: 0
 *                 example: 30
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 example: 5
 *               preferredGrade:
 *                 type: string
 *                 description: 선호 등급
 *                 enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *                 example: RARE
 *               preferredGenre:
 *                 type: string
 *                 description: 선호 장르
 *                 example: 도시
 *               preferredDescription:
 *                 type: string
 *                 description: 교환/거래 선호 상세
 *                 example: 가격 인하, 빠른 거래 희망
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, example: listing-123 }
 *                 price: { type: integer, example: 30 }
 *                 quantity: { type: integer, example: 5 }
 *                 status: { type: string, example: FOR_SALE }
 *                 preferredGrade: { type: string, example: RARE }
 *                 preferredGenre: { type: string, example: 도시 }
 *                 preferredDescription: { type: string, example: 가격 인하, 빠른 거래 희망 }
 *                 updatedAt: { type: string, example: 2025-10-28T05:20:00.000Z }
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음 (본인 판매글 아님)
 *       404:
 *         description: 존재하지 않는 판매글
 */
// 판매 수정
router.patch(
  "/marketplace/:listingId",
  verifyAccessToken,
  validate(updateListingSchema),
  controller.updateListing,
);
/**
 * @swagger
 * /marketplace/{listingId}/cancel:
 *   patch:
 *     summary: 판매 취소
 *     description: 진행 중인 판매글을 취소합니다. (상태가 FOR_SALE 또는 FOR_EXCHANGE일 때만 가능)
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         description: 취소할 판매글 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 판매가 취소되었습니다.
 *                 listingId:
 *                   type: string
 *                   example: listing-123
 *                 status:
 *                   type: string
 *                   example: CANCELLED
 *       400:
 *         description: 이미 취소/판매 완료된 글
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음 (본인 판매글 아님)
 *       404:
 *         description: 존재하지 않는 판매글
 */
// 판매 내리기 (판매 취소)
router.patch("/marketplace/:listingId/cancel", verifyAccessToken, controller.cancelListing);

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
router.get("/marketplace/my-photo-cards/:myPhotoCardId", controller.getMyPhotoCardById);

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
  controller.createListing,
);

export default router;
