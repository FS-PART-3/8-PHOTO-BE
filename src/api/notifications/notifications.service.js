import * as notificationsRepository from "./notifications.repository.js";

export const getNotifications = async (userId, { cursor, limit } = {}) => {
  const notifications = await notificationsRepository.findAllNotifications(
    userId,
    { cursor, limit }
  );

  const unreadCount =
    await notificationsRepository.findUnreadNotificationCount(userId);
  const totalCount =
    await notificationsRepository.findAllNotificationCount(userId);

  // 다음 페이지가 있는지 확인
  const hasMore = notifications.length === limit;

  // 다음 요청에 사용할 cursor (마지막 알림의 ID)
  const nextCursor =
    hasMore && notifications.length > 0
      ? notifications[notifications.length - 1].id
      : null;

  return {
    data: notifications,
    unreadCount,
    totalCount,
    pagination: {
      hasMore,
      nextCursor,
      limit,
    },
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
