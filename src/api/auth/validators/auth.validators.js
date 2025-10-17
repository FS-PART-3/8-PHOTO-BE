// 예시 코드입니다. 필요시 지우고 사용하세요.
// import { z } from "zod";

// export const registerSchema = z.object({
//   body: z.object({
//     email: z.string().email("유효한 이메일을 입력하세요."),
//     password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
//     nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다."),
//   }),
// });

// export const loginSchema = z.object({
//   body: z.object({
//     email: z.string().email(),
//     password: z.string().min(6),
//   }),
// });
