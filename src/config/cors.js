import cors from "cors";
import { env } from "./env.js";

export const corsMiddleware = cors({
  origin: (origin, cb) => {
    if (!origin || env.CORS_ORIGIN === "*" || origin.includes(env.CORS_ORIGIN)) {
      return cb(null, true);
    }
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
});
