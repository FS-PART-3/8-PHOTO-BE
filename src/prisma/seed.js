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
// import mockHistory from "./mockHistory.js";

const prisma = new PrismaClient();

async function main() {
  // 기존 데이터 삭제
  // await prisma.history.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.point.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.exchangeOffer.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.myPhotoCard.deleteMany();
  await prisma.user.deleteMany();

  // 유저 생성 (비밀번호 해싱)
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

  // 유저별 MyPhotoCard, Listing 생성
  for (const user of usersWithHashedPw) {
    const photoCards = mockMyPhotoCard(user.id, 100);
    await prisma.myPhotoCard.createMany({
      data: photoCards,
      skipDuplicates: true,
    });

    const listings = mockListing(user.id, photoCards, 50);

    for (const listing of listings) {
      await prisma.listing.create({
        data: {
          id: listing.id,
          sellerId: listing.sellerId,
          price: listing.price,
          quantity: listing.quantity,
          initQuantity: listing.initQuantity,
          status: listing.status,
          preferredGrade: listing.preferredGrade,
          preferredGenre: listing.preferredGenre,
          preferredDescription: listing.preferredDescription,
          photoCards: {
            connect: [{ id: listing.myPhotoCardId }],
          },
        },
      });
    }
  }

  const allListings = await prisma.listing.findMany();
  const allExchangeOffers = mockExchangeOffer(
    usersWithHashedPw,
    allListings,
    100
  );
  for (const offer of allExchangeOffers) {
    await prisma.exchangeOffer.create({ data: offer });
  }

  const allTransactions = mockTransaction(usersWithHashedPw, allListings, 50);
  for (const txn of allTransactions) {
    await prisma.transaction.create({ data: txn });
  }

  const allPoints = mockPoint(usersWithHashedPw, 50);
  for (const point of allPoints) {
    await prisma.point.create({ data: point });
  }

  const allNotifications = mockNotification(usersWithHashedPw, 25);
  for (const note of allNotifications) {
    await prisma.notification.create({ data: note });
  }

  // const allHistories = mockHistory(usersWithHashedPw, 50);
  // for (const hist of allHistories) {
  //   await prisma.history.create({ data: hist });
  // }

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
