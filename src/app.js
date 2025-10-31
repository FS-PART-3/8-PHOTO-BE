import express from "express";
import swaggerUi from "swagger-ui-express";
import { env, logger, corsMiddleware, swaggerSpec } from "./config/index.js";
import {
  applySecurity,
  errorHandler,
  notFoundHandler,
} from "./middlewares/index.js";

import apiRouter from "./api/index.js";
import startCronJob from "./utils/cronjob.js";

const app = express();

//  1. 공통 미들웨어

applySecurity(app); // helmet, compression, body-parser
app.use(corsMiddleware);

//  2. 헬스 체크

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

//  3. API 라우터
app.use("/api", apiRouter); //여기가 라우터 묶어둔 곳입니다. (프로젝트 초기 세팅)

//  4. Swagger 문서

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//  5. 404 + 에러 핸들러

app.use(notFoundHandler);
app.use(errorHandler);

//  6. 서버 실행

const port = process.env.PORT || 4000;
app.listen(port, () => {
  logger.info(` Server listening on http://localhost:${port}`);
  logger.info(` Swagger docs available at http://localhost:${port}/docs`);
  startCronJob(); // 서버 핑 크론 작업 시작
});

export default app;
