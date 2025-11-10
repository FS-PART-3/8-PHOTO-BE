import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../config/db.js";

export async function getPointHistory(userId) {
  const pointHistory = prisma.point.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return pointHistory;
}

// 내 포토카드 목록 조회 +검색/필터/정렬
export async function getPointHistoryListing({
  userId,
  cursor,
  search = "",
  sort = "latest",
  take = 10,
}) {
  const where = {
    userId,
    ...(search && { createdAt: { contains: search, mode: "insensitive" } }),
  };

  const orderBy =
    sort === "latest" ? { createdAt: "desc" } : { createdAt: "asc" };

  const pointHistory = prisma.point.findMany({
    where,
    include: { user: { select: { name: true, id: true } } },
    orderBy,
    take,
    skip: cursor ? 1 : 0,
    ...(cursor && { cursor: { id: cursor } }),
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
