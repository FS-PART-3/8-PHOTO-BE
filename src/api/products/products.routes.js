import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/authGuard.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { checkPhotoCardQuantity } from "../../middlewares/checkQuantity.middleware.js";
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
  controller.purchase
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
  controller.createExchangeOffer
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
  controller.updateListing
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
 *     tags:
 *       - Marketplace
 *     description: >
 *       검색, 필터, 정렬, 페이지네이션(cursor 기반) 기능을 제공합니다.
 *
 *       예시:
 *       - grade, genre: 필터링 옵션
 *       - soldOut: 품절 여부 필터 (true면 품절된 카드만, false면 재고 있는 카드만)
 *       - sort: 정렬 기준 (latest, oldest, low-price, high-price)
 *       - cursor, take: 페이지네이션
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: 판매자 ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 카드 제목 검색어
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *         description: 카드 등급 필터
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: 카드 장르 필터
 *       - in: query
 *         name: soldOut
 *         schema:
 *           type: boolean
 *         description: 품절 여부 필터 (true면 품절된 카드만 조회)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest, oldest, low-price, high-price]
 *           default: latest
 *         description: 정렬 기준
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: 커서 기반 페이지네이션을 위한 마지막 카드 ID
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           default: 15
 *         description: 한 번에 가져올 데이터 개수
 *     responses:
 *       200:
 *         description: 마켓플레이스 판매 카드 목록 반환
 *         content:
 *           application/json:
 *             example:
 *               message: "마켓플레이스 판매 카드 목록 조회 성공"
 *               data:
 *                 - id: "listing-550e8400-e29b-41d4-a716-446655440001-1"
 *                   sellerId: "550e8400-e29b-41d4-a716-446655440001"
 *                   price: 99
 *                   quantity: 1
 *                   initQuantity: 1
 *                   status: "FOR_SALE"
 *                   preferredGrade: "COMMON"
 *                   preferredGenre: "풍경"
 *                   preferredDescription: "교환 희망합니다."
 *                   isDeleted: false
 *                   createdAt: "2025-10-27T08:41:35.933Z"
 *                   updatedAt: "2025-10-27T08:41:35.933Z"
 *                   photoCards:
 *                     - id: "photo-550e8400-e29b-41d4-a716-446655440001-1"
 *                       title: "스페인 여행"
 *                       grade: "COMMON"
 *                       genre: "풍경"
 *                       imgUrl: "images/photo_1.svg"
 *                       description: "COMMON 등급의 풍경 테마 카드입니다."
 *                   seller:
 *                     id: "550e8400-e29b-41d4-a716-446655440001"
 *                     name: "유디"
 *       404:
 *         description: 해당 조건에 맞는 판매 카드 없음
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
 *         content:
 *           application/json:
 *             example:
 *               message: "내 포토카드 목록 조회 성공"
 *               data:
 *                 - id: "photo-550e..."
 *                   userId: "550e..."
 *                   title: "How Far I'll Go"
 *                   grade: "SUPER_RARE"
 *                   genre: "도시"
 *                   price: 85
 *                   quantity: 3
 *                   imgUrl: "images/photo_3.svg"
 *                   description: "SUPER_RARE 등급의 도시 테마 카드입니다."
 *                   isDeleted: false
 *                   createdAt: "2025-10-27T08:43:27.712Z"
 *                   updatedAt: "2025-10-27T08:43:27.712Z"
 *                   user:
 *                     id: "550e..."
 *                     name: "수현"
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
 *         content:
 *           application/json:
 *             example:
 *              message: "포토카드 상세 조회 성공"
 *              data:
 *               id: "photo-550e..."
 *               userId: "550e..."
 *               title: "How Far I'll Go"
 *               grade: "SUPER_RARE"
 *               genre: "도시"
 *               price: 85
 *               quantity: 3
 *               imgUrl: "images/photo_3.svg"
 *               description: "SUPER_RARE 등급의 도시 테마 카드입니다."
 *               isDeleted: false
 *               createdAt: "2025-10-27T08:43:27.712Z"
 *               updatedAt: "2025-10-27T08:43:27.712Z"
 *               user:
 *                 id: "550e8400-e29b-41d4-a716-446655440005"
 *                 name: "수현"
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
  checkPhotoCardQuantity,
  controller.createListing
);

/**
 * @swagger
 * /marketplace/{listingId}:
 *   get:
 *     summary: 판매글 상세 조회
 *     description: 판매글 ID를 이용해 상세 정보를 조회합니다.
 *     tags: [Marketplace]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *         description: 판매글 ID
 *     responses:
 *       200:
 *         description: 상세 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "listing-550e8400-e29b-41d4-a716-446655440004-15"
 *                 price:
 *                   type: integer
 *                   example: 26
 *                 quantity:
 *                   type: integer
 *                   example: 1
 *                 initQuantity:
 *                   type: integer
 *                   example: 1
 *                 status:
 *                   type: string
 *                   enum: [FOR_SALE, FOR_EXCHANGE, SOLD_OUT, CANCELLED]
 *                   example: "FOR_SALE"
 *                 seller:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440004"
 *                     name:
 *                       type: string
 *                       example: "희성"
 *                 myPhotoCard:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "photo-550e8400-e29b-41d4-a716-446655440004-15"
 *                     title:
 *                       type: string
 *                       example: "How Far I'll Go"
 *                     imgUrl:
 *                       type: string
 *                       example: "images/photo_3.svg"
 *                     grade:
 *                       type: string
 *                       enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *                       example: "SUPER_RARE"
 *                     genre:
 *                       type: string
 *                       enum: [풍경, 인물, 도시, 자연]
 *                       example: "도시"
 *                     description:
 *                       type: string
 *                       example: "SUPER_RARE 등급의 도시 테마 카드입니다."
 *                     price:
 *                       type: integer
 *                       example: 31
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                 photoCards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "photo-550e8400-e29b-41d4-a716-446655440004-15"
 *                       title:
 *                         type: string
 *                         example: "How Far I'll Go"
 *                       imgUrl:
 *                         type: string
 *                         example: "images/photo_3.svg"
 *                       grade:
 *                         type: string
 *                         example: "SUPER_RARE"
 *                       genre:
 *                         type: string
 *                         example: "도시"
 *                       description:
 *                         type: string
 *                         example: "SUPER_RARE 등급의 도시 테마 카드입니다."
 *                       price:
 *                         type: integer
 *                         example: 31
 *                       quantity:
 *                         type: integer
 *                         example: 2
 *                 preferredGrade:
 *                   type: string
 *                   example: "SUPER_RARE"
 *                 preferredGenre:
 *                   type: string
 *                   example: "도시"
 *                 preferredDescription:
 *                   type: string
 *                   example: "같은 장르 카드와 교환하고 싶어요."
 *             example:
 *               id: "listing-550e8400-e29b-41d4-a716-446655440004-15"
 *               price: 26
 *               quantity: 1
 *               initQuantity: 1
 *               status: "FOR_SALE"
 *               seller:
 *                 id: "550e8400-e29b-41d4-a716-446655440004"
 *                 name: "희성"
 *               myPhotoCard:
 *                 id: "photo-550e8400-e29b-41d4-a716-446655440004-15"
 *                 title: "How Far I'll Go"
 *                 imgUrl: "images/photo_3.svg"
 *                 grade: "SUPER_RARE"
 *                 genre: "도시"
 *                 description: "SUPER_RARE 등급의 도시 테마 카드입니다."
 *                 price: 31
 *                 quantity: 2
 *
 *       404:
 *         description: 존재하지 않는 판매글
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "존재하지 않는 판매글입니다."
 */
router.get("/marketplace/:listingId", controller.getListingDetail);

export default router;
