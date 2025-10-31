import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../config/db.js";

export async function getPointHistory(user) {
  const pointHistory = prisma.point.findMany({
    where: { userId: user.id },
  });
  return pointHistory;
}

export async function getCurrentPoints(user) {
  const result = await prisma.point.aggregate({
    //prisma 집계 기능
    _sum: { amount: true },
    where: { userId: user.id },
  });
  return result._sum.amount;
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
