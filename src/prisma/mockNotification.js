const mockNotification = (users, count = 5) => {
  const types = [
    "EXCHANGE_PROPOSED",
    "EXCHANGE_ACCEPTED",
    "EXCHANGE_REJECTED",
    "PURCHASE_COMPLETED",
    "SALE_COMPLETED",
    "SOLD_OUT",
  ];
  const notifications = [];

  for (let i = 0; i < count; i++) {
    const user = users[i % users.length];
    const type = types[i % types.length];

    notifications.push({
      id: `notification-${user.id}-${i + 1}`,
      userId: user.id,
      type,
      payload: { message: `Sample ${type} notification` },
      isRead: Math.random() > 0.5,
      createdAt: new Date(),
    });
  }

  return notifications;
};

export default mockNotification;
