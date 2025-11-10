const mockHistory = (users, count = 50) => {
  const actions = [
    "CREATE_PHOTO_CARD",
    "UPDATE_PHOTO_CARD",
    "DELETE_PHOTO_CARD",
    "CREATE_LISTING",
    "PROPOSE_EXCHANGE",
    "APPROVE_EXCHANGE",
    "REJECT_EXCHANGE",
    "RANDOM_BOX_REWARD",
    "UPDATE_PROFILE",
    "DELETE_ACCOUNT",
    "RESET_PASSWORD",
    "LOGIN",
    "LOGOUT",
    "REGISTER",
  ];
  const entityTypes = [
    "USER",
    "MY_PHOTO_CARD",
    "LISTING",
    "EXCHANGE_OFFER",
    "TRANSACTION",
    "POINT",
    "NOTIFICATION",
    "HISTORY",
  ];

  const histories = [];

  for (let i = 0; i < count; i++) {
    const user = users[i % users.length];
    const action = actions[i % actions.length];
    const entityType = entityTypes[i % entityTypes.length];

    histories.push({
      id: `history-${user.id}-${i + 1}`,
      userId: user.id,
      action,
      description: `Sample ${action} on ${entityType}`,
      entityType,
      entityId: `entity-${i + 1}`,
      previousData: null,
      newData: { sampleField: "sampleValue" },
      createdAt: new Date(),
    });
  }

  return histories;
};

export default mockHistory;
