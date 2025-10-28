import { Router } from "express";
import * as controller from "./exchanges.controller.js";
import { verifyAccessToken } from "../../middlewares/authGuard.js";
const router = Router();
/**
 * @swagger
 * tags:
 *   - name: ExchangeOffers
 *     description: 교환 신청 관련 API (승인, 거절, 취소)
 */
/**
 * @swagger
 * /marketplace/exchange-offers/{offerId}/accept:
 *   patch:
 *     summary: 교환 신청 승인
 *     description: 판매자가 본인 판매글에 대한 교환 신청을 승인합니다.
 *     tags: [ExchangeOffers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         description: 승인할 교환 신청 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 승인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offerAfter:
 *                   type: object
 *                   properties:
 *                     id: { type: string, example: "offer-123" }
 *                     listingId: { type: string, example: "listing-456" }
 *                     status: { type: string, example: "ACCEPTED" }
 *                 listingAfter:
 *                   type: object
 *                   properties:
 *                     id: { type: string, example: "listing-456" }
 *                     status: { type: string, example: "FOR_EXCHANGE" }
 *                     quantity: { type: integer, example: 2 }
 *       400:
 *         description: 잘못된 요청 (이미 처리됨 / 판매글 종료 / 판매자 보유 수량 부족 등)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 이미 처리된 교환 신청입니다.
 *       401:
 *         description: 인증 실패 (토큰 누락/만료)
 *       403:
 *         description: 권한 없음 (판매자만 승인 가능)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 해당 판매글의 판매자만 승인할 수 있습니다.
 *       404:
 *         description: 존재하지 않는 리소스 (오퍼/판매글 없음)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 관련 판매글이 존재하지 않습니다.
 *       500:
 *         description: 서버 내부 오류 (원본 포토카드 누락 등)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 판매글에 연결된 원본 포토카드가 없습니다. }
 */
// 교환 승인
router.patch(
  "/marketplace/exchange-offers/:offerId/accept",
  verifyAccessToken,
  controller.approveExchangeOffer,
);
/**
 * @swagger
 * /marketplace/exchange-offers/{offerId}/reject:
 *   patch:
 *     summary: 교환 신청 거절
 *     description: 판매자가 본인 판매글에 대한 교환 신청을 거절합니다. (PENDING 상태만 거절 가능)
 *     tags: [ExchangeOffers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         description: 거절할 교환 신청 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 거절 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offerAfter:
 *                   type: object
 *                   properties:
 *                     id: { type: string, example: "offer-123" }
 *                     listingId: { type: string, example: "listing-456" }
 *                     status: { type: string, example: "REJECTED" }
 *                 listing:
 *                   type: object
 *                   properties:
 *                     id: { type: string, example: "listing-456" }
 *                     status: { type: string, example: "FOR_EXCHANGE" }
 *       400:
 *         description: 잘못된 요청 (이미 처리된 교환 신청 등)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 이미 처리된 교환 신청입니다.
 *       401:
 *         description: 인증 실패 (토큰 누락/만료)
 *       403:
 *         description: 권한 없음 (판매자만 거절 가능)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 해당 판매글의 판매자만 거절할 수 있습니다.
 *       404:
 *         description: 존재하지 않는 리소스 (오퍼/판매글 없음)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 존재하지 않는 교환 신청입니다.
 */

// 교환 거절
router.patch(
  "/marketplace/exchange-offers/:offerId/reject",
  verifyAccessToken,
  controller.rejectExchangeOffer,
);
/**
 * @swagger
 * /marketplace/exchange-offers/{offerId}/cancel:
 *   patch:
 *     summary: 교환 신청 취소
 *     description: 교환 신청자가 본인의 PENDING 상태 교환 신청을 취소합니다.
 *     tags: [ExchangeOffers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         description: 취소할 교환 신청 ID
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
 *                 offerAfter:
 *                   type: object
 *                   properties:
 *                     id: { type: string, example: "offer-123" }
 *                     listingId: { type: string, example: "listing-456" }
 *                     status: { type: string, example: "CANCELLED" }
 *       400:
 *         description: 잘못된 요청 (이미 처리된 교환 신청 등)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 이미 처리된 교환 신청입니다.
 *       401:
 *         description: 인증 실패 (토큰 누락/만료)
 *       403:
 *         description: 권한 없음 (본인 신청만 취소 가능)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 본인 교환 신청만 취소할 수 있습니다.
 *       404:
 *         description: 존재하지 않는 교환 신청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 존재하지 않는 교환 신청입니다.
 */

// 교환 취소
router.patch(
  "/marketplace/exchange-offers/:offerId/cancel",
  verifyAccessToken,
  controller.cancelExchangeOffer,
);

export default router;
