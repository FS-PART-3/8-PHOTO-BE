const offeredDescriptions = [
  "교환 희망합니다.",
  "레어 등급으로 교환 원해요.",
  "같은 장르 카드와 교환하고 싶어요.",
  "판매 또는 교환 가능.",
];

const mockExchangeOffer = (users, listings, count = 20) => {
  const offers = [];

  const exchangeableListings = listings.filter(
    (l) => l.status === "FOR_EXCHANGE"
  );

  for (let i = 0; i < count; i++) {
    if (exchangeableListings.length === 0) break;

    const listing = exchangeableListings[i % exchangeableListings.length];
    const offeredDescription =
      offeredDescriptions[i % offeredDescriptions.length];

    const possibleUsers = users.filter((u) => u.id !== listing.sellerId);
    const offeredBy =
      possibleUsers[Math.floor(Math.random() * possibleUsers.length)];

    offers.push({
      id: `exchange-${listing.id}-${offeredBy.id}-${i + 1}`,
      listingId: listing.id,
      offeredById: offeredBy.id,
      offeredDescription,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return offers;
};

export default mockExchangeOffer;
