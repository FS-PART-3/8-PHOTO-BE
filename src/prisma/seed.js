import bcrypt from "bcrypt";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

import mockUser from "./mockUser.js";
import mockMyPhotoCard from "./mockMyPhotoCard.js";
import mockListing from "./mockListing.js";
import mockExchangeOffer from "./mockExchangeOffer.js";
import mockTransaction from "./mockTransaction.js";
import mockPoint from "./mockPoint.js";
import mockNotification from "./mockNotification.js";
import mockHistory from "./mockHistory.js";

const prisma = new PrismaClient();

async function main() {
  // await prisma.user.create({ data: { name: "Alice" } });

  // 기존 데이터 삭제
  // await prisma.history.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.point.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.exchangeOffer.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.myPhotoCard.deleteMany();
  await prisma.user.deleteMany();

  //mock 데이터 삽입
  // 이메일 로그인 사용자 -> 비밀번호 해싱
  const usersWithHashedPw = await Promise.all(
    mockUser.map(async (u) => {
      if (u.provider === "local" && u.password) {
        const hashedPw = await bcrypt.hash(u.password, 10);
        return { ...u, password: hashedPw };
      }
      return u;
    })
  );

  await prisma.user.createMany({
    data: usersWithHashedPw,
    skipDuplicates: true,
  });

  // 유저별 데이터 생성
  const allPhotoCards = [];
  const allListings = [];

  for (const user of usersWithHashedPw) {
    const photoCards = mockMyPhotoCard(user.id, 100);
    const listings = mockListing(user.id, photoCards, 50);

    allPhotoCards.push(...photoCards);
    allListings.push(...listings);
  }

  await prisma.myPhotoCard.createMany({
    data: allPhotoCards,
    skipDuplicates: true,
  });

  await prisma.listing.createMany({
    data: allListings,
    skipDuplicates: true,
  });

  const allExchangeOffers = mockExchangeOffer(
    usersWithHashedPw,
    allListings,
    100
  );

  await prisma.exchangeOffer.createMany({
    data: allExchangeOffers,
    skipDuplicates: true,
  });

  const allTransactions = mockTransaction(usersWithHashedPw, allListings, 50);
  await prisma.transaction.createMany({
    data: allTransactions,
    skipDuplicates: true,
  });

  const allPoints = mockPoint(usersWithHashedPw, 50);
  await prisma.point.createMany({
    data: allPoints,
    skipDuplicates: true,
  });

  const allNotifications = mockNotification(usersWithHashedPw, 25);
  await prisma.notification.createMany({
    data: allNotifications,
    skipDuplicates: true,
  });

  // const allHistories = mockHistory(usersWithHashedPw, 50);
  // await prisma.history.createMany({
  //   data: allHistories,
  //   skipDuplicates: true,
  // });

  console.log("Seeding completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
