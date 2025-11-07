import { Router } from "express";
import * as controller from "./notifications.controller.js";
import { verifyAccessToken } from "../../middlewares/authGuard.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  getNotificationsSchema,
  readNotificationSchema,
} from "./validators/notifications.validators.js";
const notificationsRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: 알림 관리 API
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: 알림 목록 조회 (무한 스크롤)
 *     description: 현재 로그인한 사용자의 알림을 커서 기반 페이징으로 조회합니다.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: 이전 요청의 nextCursor 값 (첫 요청 시 생략)
 *         example: notif-123
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: 한 번에 가져올 알림 개수
 *         example: 20
 *     responses:
 *       200:
 *         description: 알림 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 unreadCount:
 *                   type: integer
 *                   example: 5
 *                 totalCount:
 *                   type: integer
 *                   example: 50
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     hasMore:
 *                       type: boolean
 *                       example: true
 *                     nextCursor:
 *                       type: string
 *                       nullable: true
 *                       example: notif-456
 *                     limit:
 *                       type: integer
 *                       example: 20
 *       401:
 *         description: 인증 실패 (토큰 누락/만료)
 *       500:
 *         description: 서버 내부 오류
 */
notificationsRouter.get(
  "/notifications",
  verifyAccessToken,
  validate(getNotificationsSchema),
  controller.getNotifications
);

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: 알림 읽음 처리
 *     description: 특정 알림을 읽음 상태로 변경합니다.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: 읽음 처리할 알림 ID
 *         example: notif-123
 *     responses:
 *       200:
 *         description: 알림 읽음 처리 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: notif-123
 *                 userId:
 *                   type: string
 *                   example: user-456
 *                 type:
 *                   type: string
 *                   example: PURCHASE
 *                 title:
 *                   type: string
 *                   example: 포토카드 구매 완료
 *                 message:
 *                   type: string
 *                   example: 스페인 여행 포토카드 구매가 완료되었습니다.
 *                 isRead:
 *                   type: boolean
 *                   example: true
 *                 relatedId:
 *                   type: string
 *                   nullable: true
 *                   example: transaction-789
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-10-28T10:30:00.000Z
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-10-28T10:30:00.000Z
 *       400:
 *         description: 잘못된 요청 (notificationId 누락)
 *       401:
 *         description: 인증 실패 (토큰 누락/만료)
 *       403:
 *         description: 권한 없음 (다른 사용자의 알림)
 *       404:
 *         description: 존재하지 않는 알림
 *       500:
 *         description: 서버 내부 오류
 */
notificationsRouter.patch(
  "/notifications/:notificationId/read",
  verifyAccessToken,
  validate(readNotificationSchema),
  controller.readNotification
);

export default notificationsRouter;
