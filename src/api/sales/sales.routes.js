import { Router } from "express";
import * as controller from "./sales.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { getMySalesSchema } from "./validators/sales.validators.js";
import { verifyAccessToken } from "../../middlewares/authGuard.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Sales
 *   description: 판매 내역 API
 */

/**
 * @swagger
 * /my-photo-cards/sales:
 *   get:
 *     summary: 내 판매 내역 조회
 *     description: 현재 로그인한 사용자의 포토카드 판매 내역을 조회합니다. 검색, 필터링, 페이지네이션 기능을 제공합니다.
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: 포토카드 제목 검색어
 *         example: 스페인
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *           enum: [COMMON, RARE, SUPERRARE, LEGENDARY]
 *         description: 포토카드 등급 필터
 *         example: RARE
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *           enum: [풍경, 인물, 도시, 자연]
 *         description: 포토카드 장르 필터
 *         example: 풍경
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 판매 내역 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: listing-123
 *                       sellerId:
 *                         type: string
 *                         example: user-456
 *                       price:
 *                         type: integer
 *                         example: 50
 *                       quantity:
 *                         type: integer
 *                         example: 1
 *                       initQuantity:
 *                         type: integer
 *                         example: 3
 *                       status:
 *                         type: string
 *                         enum: [FOR_SALE, FOR_EXCHANGE, SOLD_OUT, CANCELLED]
 *                         example: FOR_SALE
 *                       preferredGrade:
 *                         type: string
 *                         nullable: true
 *                         example: RARE
 *                       preferredGenre:
 *                         type: string
 *                         nullable: true
 *                         example: 풍경
 *                       preferredDescription:
 *                         type: string
 *                         nullable: true
 *                         example: 선호 카드 설명
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-10-27T09:14:06.209Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-10-27T09:14:06.209Z
 *                       photoCards:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           grade:
 *                             type: string
 *                           genre:
 *                             type: string
 *                           imgUrl:
 *                             type: string
 *                           description:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalItems:
 *                       type: integer
 *                       example: 47
 *       400:
 *         description: 잘못된 요청 (유효성 검사 실패)
 *       401:
 *         description: 인증 실패 (토큰 누락/만료)
 *       500:
 *         description: 서버 내부 오류
 */
router.get(
  "/my-photo-cards/sales",
  verifyAccessToken,
  validate(getMySalesSchema),
  controller.getMySales
);

export default router;
