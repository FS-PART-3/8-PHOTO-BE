import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../config/db.js";

export async function getPoint(user) {
  const pointHistory = prisma.point.findMany({
    where: { userId: user.id },
  });
  console.log(pointHistory);
  //const sum = pointHistory.reduce((acc, v) => acc + v.amount, 0);
  return pointHistory;
}

export async function createReward(user, amount) {
  const id = uuidv4();
  return prisma.point.create({
    data: {
      id: id,
      amount: amount,
      reason: "RANDOM_BOX_REWARD",
      user: { connect: { id: user.id } },
    },
  });
}
