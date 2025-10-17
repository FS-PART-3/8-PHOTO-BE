import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "PhotoCard API", version: "1.0.0" },
    servers: [{ url: "/api" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // 라우트 주석 스캔 경로들(필요시 추가)
  apis: ["./src/api/**/*.routes.js", "./src/api/**/*.controller.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
