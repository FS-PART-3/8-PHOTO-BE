import { uuid } from "zod";
import { prisma } from "../../config/db.js";

export async function getPoint(user) {
  const pointHistory = prisma.point.findMany({
    where: { userId: user.id },
  });
  const sum = pointHistory.reduce((acc, v) => acc + v.amount, 0);
  return sum;
}

export async function createReward(user, amount) {
  return prisma.point.create({
    id: uuid(),
    amount: amount,
    reason: "RANDOM_BOX_REWARD",
    user: { connect: { id: user.id } },
  });
}
