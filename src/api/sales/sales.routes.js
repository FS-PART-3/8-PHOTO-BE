import { Router } from "express";
import * as controller from "./sales.controller.js";
import { validate } from "../../middlewares/validateMiddleware.js";
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
 *     description: 현재 로그인한 사용자의 포토카드 판매 내역을 조회합니다. 검색, 필터링 기능을 제공하며, 등급별 카드 개수도 함께 반환합니다.
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: 포토카드 제목 검색어 (대소문자 구분 없음)
 *         example: 스페인
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *           enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [FOR_SALE, FOR_EXCHANGE, SOLD_OUT, CANCELLED]
 *         description: 판매 상태 필터
 *         example: FOR_SALE
 *       - in: query
 *         name: soldOut
 *         schema:
 *           type: boolean
 *         description: 품절 여부 필터 (true면 재고 0, false면 재고 1개 이상)
 *         example: false
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
 *           default: 15
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 판매 내역 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cards:
 *                   type: array
 *                   description: 판매 중인 포토카드 목록
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: 리스팅 ID
 *                         example: listing-123
 *                       status:
 *                         type: string
 *                         enum: [FOR_SALE, FOR_EXCHANGE, SOLD_OUT, CANCELLED]
 *                         description: 판매 상태
 *                         example: FOR_SALE
 *                       price:
 *                         type: integer
 *                         description: 판매 가격
 *                         example: 50
 *                       quantity:
 *                         type: integer
 *                         description: 현재 남은 수량
 *                         example: 2
 *                       title:
 *                         type: string
 *                         description: 포토카드 제목
 *                         example: 스페인 바르셀로나 야경
 *                       grade:
 *                         type: string
 *                         enum: [COMMON, RARE, SUPER_RARE, LEGENDARY]
 *                         description: 포토카드 등급
 *                         example: RARE
 *                       genre:
 *                         type: string
 *                         enum: [풍경, 인물, 도시, 자연]
 *                         description: 포토카드 장르
 *                         example: 풍경
 *                       imgUrl:
 *                         type: string
 *                         description: 포토카드 이미지 URL
 *                         example: https://example.com/image.jpg
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: 등록일시
 *                         example: 2025-10-27T09:14:06.209Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: 수정일시
 *                         example: 2025-10-27T09:14:06.209Z
 *                       user:
 *                         type: object
 *                         description: 판매자 정보
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: 판매자 ID
 *                             example: user-456
 *                           name:
 *                             type: string
 *                             description: 판매자 이름
 *                             example: 홍길동
 *                 countsGroup:
 *                   type: object
 *                   description: 카드 개수 통계
 *                   properties:
 *                     totalCounts:
 *                       type: integer
 *                       description: 전체 카드 개수
 *                       example: 47
 *                     gradeCounts:
 *                       type: object
 *                       description: 등급별 카드 개수
 *                       properties:
 *                         COMMON:
 *                           type: integer
 *                           example: 20
 *                         RARE:
 *                           type: integer
 *                           example: 15
 *                         SUPER_RARE:
 *                           type: integer
 *                           example: 10
 *                         LEGENDARY:
 *                           type: integer
 *                           example: 2
 *       400:
 *         description: 잘못된 요청 (유효성 검사 실패)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid query parameters
 *       401:
 *         description: 인증 실패 (토큰 누락/만료)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.get(
  "/my-photo-cards/sales",
  verifyAccessToken,
  validate(getMySalesSchema),
  controller.getMySales
);

export default router;
