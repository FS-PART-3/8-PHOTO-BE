import { prisma } from "../../config/db.js";

/**
 * 알림 목록 조회
 * @param {string} userId
 * @returns {Promise<Notification[]>}
 */
export const findAllNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      payload: true,
      isRead: true,
      createdAt: true,
    },
  });
};

/**
 * 읽지 않은 알림 개수 조회
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const findUnreadNotificationCount = async (userId) => {
  return prisma.notification.count({ where: { userId, isRead: false } });
};

/**
 * 모든 알림 개수 조회
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const findAllNotificationCount = async (userId) => {
  return prisma.notification.count({ where: { userId } });
};

/**
 * 알림 읽음 처리
 * @param {string} userId
 * @param {string} notificationId
 * @returns {Promise<Notification>}
 */
export const updateNotification = async (userId, notificationId) => {
  return prisma.notification.update({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
};
