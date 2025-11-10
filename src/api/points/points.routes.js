import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/authGuard.js";
import { pointHistory, points, reward } from "./points.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 인가 (로그인) API
 */

/**
 * @swagger
 * /points/history:
 *   get:
 *     summary: 포인트 전체 기록 조회
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 포인트 전체 기록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 points:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string, example: "a2636ac4-..." }
 *                       userId: { type: string, example: "a2636ac4-..." }
 *                       amout: { type: integer, example: 137 }
 *                       reason: { type: string, example: "RANDOM_BOX_REWARD" }
 *                       createdAt: { type: string, example: "2025-11-02T13:27:09.333Z" }
 *       400:
 *         description: 토큰 형식 오류 / 유저 포인트 정보 없음
 *       401:
 *         description: 인증 실패 (액세스 토큰 없음, 만료)
 *       500:
 *         description: 서버 내부 오류
 */
router.get("/history", verifyAccessToken, pointHistory);

/**
 * @swagger
 * /points/current:
 *   get:
 *     summary: 현재 포인트 조회
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 현재 포인트 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 points: { type: integer, example: 137 }
 *       400:
 *         description: 토큰 형식 오류 / 유저 포인트 정보 없음
 *       401:
 *         description: 인증 실패 (액세스 토큰 없음, 만료)
 *       500:
 *         description: 서버 내부 오류
 */
router.get("/current", verifyAccessToken, points);

/**
 * @swagger
 * /points/reward:
 *   post:
 *     summary: 리워드 포인트 발급 (랜덤 포인트)
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 포인트 발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, example: "a2636ac4-..." }
 *                 userId: { type: string, example: "a2636ac4-..." }
 *                 amout: { type: integer, example: 137 }
 *                 reason: { type: string, example: "RANDOM_BOX_REWARD" }
 *                 createdAt: { type: string, example: "2025-11-02T13:27:09.333Z" }
 *       400:
 *         description: 토큰 형식 오류 / 유저 포인트 정보 없음
 *       401:
 *         description: 인증 실패 (액세스 토큰 없음, 만료)
 *       500:
 *         description: 서버 내부 오류
 */
router.post("/reward", verifyAccessToken, reward);

export default router;
