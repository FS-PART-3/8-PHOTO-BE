import cors from "cors";
import { env } from "./env.js";

// const allowedOrigins = env.CORS_ORIGIN
//   ? env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
//   : [];

// export const corsMiddleware = cors({
//   origin: (origin, cb) => {
//     if (!origin || env.CORS_ORIGIN === "*" || allowedOrigins.includes(origin)) {
//       return cb(null, true);
//     }
//     cb(new Error("Not allowed by CORS"));
//   },
//   credentials: true,
// });

export const corsMiddleware = cors({
  origin: (origin, cb) => {
    if (
      !origin ||
      env.CORS_ORIGIN === "*" ||
      origin.includes(env.CORS_ORIGIN)
    ) {
      return cb(null, true);
    }
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
});
