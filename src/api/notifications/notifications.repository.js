import { prisma } from "../../config/db.js";

/**
 * 알림 목록 조회 (커서 기반 페이징)
 * @param {string} userId
 * @param {Object} options
 * @param {string} options.cursor - 마지막으로 본 알림 ID
 * @param {number} options.limit - 가져올 개수 (기본 20)
 * @returns {Promise<Notification[]>}
 */
export const findAllNotifications = async (
  userId,
  { cursor, limit = 5 } = {}
) => {
  const where = { userId };

  // cursor가 있으면 해당 ID 이후의 알림만 조회
  const cursorOption = cursor
    ? {
        cursor: { id: cursor },
        skip: 1, // cursor 자체는 제외
      }
    : {};

  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },

    take: limit,
    ...cursorOption,
    select: {
      id: true,
      userId: true,
      type: true, // type도 추가하면 좋습니다
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
