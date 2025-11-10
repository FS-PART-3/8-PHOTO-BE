import { z } from "zod";

/**
 * GET /notifications 검증
 */
export const getNotificationsSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

/**
 * PATCH /notifications/:notificationId/read 검증
 */
export const readNotificationSchema = z.object({
  params: z.object({
    notificationId: z.string().min(1, "notificationId는 필수입니다."),
  }),
  query: z.object({}).optional(),
  body: z.object({}).optional(),
});
