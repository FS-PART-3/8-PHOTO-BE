import * as notificationsService from "./notifications.service.js";

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const result = await notificationsService.getNotifications(userId);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const readNotification = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const notificationId = req.params.notificationId; // URL 파라미터에서 가져오기

    const notification = await notificationsService.readNotification(
      userId,
      notificationId
    );

    return res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};
