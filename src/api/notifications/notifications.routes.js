import { Router } from "express";
import * as controller from "./notifications.controller.js";
import { verifyAccessToken } from "../../middlewares/authGuard.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  getNotificationsSchema,
  readNotificationSchema,
} from "./validators/notifications.validators.js";
const notificationsRouter = Router();

notificationsRouter.get(
  "/notifications",
  verifyAccessToken,
  validate(getNotificationsSchema),
  controller.getNotifications
);
notificationsRouter.patch(
  "/notifications/:notificationId/read",
  verifyAccessToken,
  validate(readNotificationSchema),
  controller.readNotification
);

export default notificationsRouter;
