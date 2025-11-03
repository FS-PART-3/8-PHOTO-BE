import { Router } from "express";
import passport from "../../config/passport.js";
import {
  verifyAccessToken,
  verifyRefreshToken,
} from "../../middlewares/authGuard.js";

//import auth from "../middlewares/auth.js";
import {
  signup,
  login,
  logout,
  refresh,
  setRefreshToken,
  check,
  getUserData,
  oauthLogin,
} from "./auth.controller.js";

const router = Router();

/* 일반 (이메일/패스워드) 회원가입/로그인 ---*/

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 인가 (로그인) API
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: 이메일
 *               name:
 *                 type: string
 *                 description: 유저 닉네임
 *               password:
 *                 type: string
 *                 description: 비밀번호
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, example: "a2636ac4-..." }
 *                 name: { type: string, example: "John Joe" }
 *                 email: { type: string, example: "example@test.com" }
 *                 createdAt: { type: string, example: "2025-11-02T13:27:09.333Z" }
 *       400:
 *         description: 잘못된 입력 형식 (이메일, 비밀번호 형식 오류)
 *       409:
 *         description: 잘못된 요청 (이메일 중복)
 *       500:
 *         description: 서버 내부 오류 (유저 생성 실패)
 */
router.post("/signup", signup);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: 이메일
 *               password:
 *                 type: string
 *                 description: 비밀번호
 *     responses:
 *       200:
 *         description: 로그인 성공
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
 *         description: 잘못된 입력 형식 (이메일, 비밀번호 형식 오류)
 *       401:
 *         description: 인증 실패 (등록되지 않은 이메일, 비밀번호 불일치)
 *       500:
 *         description: 서버 내부 오류
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *       500:
 *         description: 서버 내부 오류
 */
router.post("/logout", logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: 액세스 토큰 및 리프레쉬 토큰 재발급
 *     tags: [Auth]
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: true
 *         schema:
 *           type: string
 *         description: 리프레쉬 토큰
 *     responses:
 *       200:
 *         description: 토큰 재발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 accessToken: {type: string, exmaple: "eyJhbGciOiJIUzI.."}
 *       401:
 *         description: 인증 실패 (리프레쉬 토큰 없음 또는 만료)
 *       500:
 *         description: 서버 내부 오류
 */
router.post("/refresh", verifyRefreshToken, refresh); //리프레쉬 토큰 인증 필요.

/**
 * @swagger
 * /auth/check:
 *   post:
 *     summary: 인증, 인가 여부 판단 (페이지 이동 등)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 인증 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated: { type: boolean, example: true }
 *       400:
 *         description: 토큰 형식 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated: { type: boolean, example: false }
 *       401:
 *         description: 인증 실패 (액세스 토큰 없음, 만료)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated: { type: boolean, example: false }
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated: { type: boolean, example: false }
 */
router.post("/check", check);

/**
 * @swagger
 * /auth/userdata:
 *   get:
 *     summary: 인증, 인가 여부 판단 (페이지 이동 등)
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
router.get("/userdata", verifyAccessToken, getUserData);

/**
 * @swagger
 * /auth/refreshtoken
 *   get:
 *     summary: 액세스 토큰을 통해 리프레쉬 토큰 발급
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 리프레쉬 토큰 발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *       400:
 *         description: 토큰 형식 오류
 *       401:
 *         description: 인증 실패 (액세스 토큰 없음, 만료)
 *       500:
 *         description: 서버 내부 오류
 */
router.post("/refreshtoken", verifyAccessToken, setRefreshToken); //액세스 토큰 인증 필요.

/* --- 구글 소셜 로그인(회원가입) --- */
//구글 로그인 페이지로 이동시키는 라우터
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }) // 구글 인증 미들웨어 - 세션을 사용하지 않도록 명시
);

//로그인 성공시 리디렉션 라우터
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }), // 구글 인증 미들웨어 - 세션을 사용하지 않도록 명시
  oauthLogin
);

//테스트용 엔드포인트
router.get("/test", (req, res) => {
  return res.json({ test: "테스트" });
});

export default router;
