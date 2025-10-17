// 예시 코드입니다.
// import { verifyToken } from "../auth/utils/token.js";

// export function authGuard(req, res, next) {
//   const header = req.headers.authorization || "";
//   const token = header.startsWith("Bearer ") ? header.slice(7) : null;
//   if (!token) return res.status(401).json({ message: "Unauthorized" });

//   try {
//     const payload = verifyToken(token);
//     req.user = payload; // { id, email, ... }
//     next();
//   } catch {
//     res.status(401).json({ message: "Invalid or expired token" });
//   }
// }
