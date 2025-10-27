import * as notificationsRepository from "./notifications.repository.js";

export const getNotifications = async (userId) => {
  const notifications =
    await notificationsRepository.findAllNotifications(userId);

  const notificationCount =
    await notificationsRepository.findUnreadNotificationCount(userId);

  const allNotificationCount =
    await notificationsRepository.findAllNotificationCount(userId);

  return {
    data: notifications,
    unreadCount: notificationCount,
    totalCount: allNotificationCount,
  };
};

export const readNotification = async (userId, notificationId) => {
  const updated = await notificationsRepository.updateNotification(
    userId,
    notificationId
  );

  return {
    id: updated.id,
    isRead: updated.isRead,
  };
};
