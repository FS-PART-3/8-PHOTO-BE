const mockPoint = (users, count = 50) => {
  const reasons = ["PURCHASE", "SALE", "RANDOM_BOX_REWARD", "ADMIN_ADJUSTMENT"];
  const points = [];

  for (let i = 0; i < count; i++) {
    const user = users[i % users.length];
    const amount = Math.floor(Math.random() * 100) + 1;
    const reason = reasons[i % reasons.length];

    points.push({
      id: `point-${user.id}-${i + 1}`,
      userId: user.id,
      amount,
      reason,
      createdAt: new Date(),
    });
  }

  return points;
};

export default mockPoint;
