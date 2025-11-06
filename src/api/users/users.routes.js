import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/authGuard.js";
import { getUserData, updateUserName } from "./users.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 유저 관련 데이터
 */

/**
 * @swagger
 * /users/data:
 *   get:
 *     summary: 유저 데이터 조회 (닉네임, 포인트)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 유저 데이터 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, example: "a2636ac4-..." }
 *                 name: { type: string, example: "John Joe" }
 *                 email: { type: string, example: "example@test.com" }
 *                 createdAt: { type: string, example: "2025-11-02T13:27:09.333Z" }
 *                 points: {type: integer, example: "2745" }
 *                 accessToken: {type: string, exmaple: "eyJhbGciOiJIUzI.."}
 *       400:
 *         description: 토큰 형식 오류
 *       401:
 *         description: 인증 실패 (액세스 토큰 없음, 만료)
 *       500:
 *         description: 서버 내부 오류
 */
router.get("/data", verifyAccessToken, getUserData);
router.post("/name", verifyAccessToken, updateUserName);

export default router;
