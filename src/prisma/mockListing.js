const mockListing = (userId, myPhotoCards, count = 50) => {
  const preferredGrades = ["COMMON", "RARE", "SUPERRARE", "LEGENDARY"];
  const preferredGenres = ["풍경", "인물", "도시", "자연"];
  const preferredDescriptions = [
    "교환 희망합니다.",
    "레어 등급으로 교환 원해요.",
    "같은 장르 카드와 교환하고 싶어요.",
    "판매 또는 교환 가능.",
  ];

  const listings = [];
  for (let i = 0; i < count; i++) {
    const photo = myPhotoCards[i % myPhotoCards.length];
    const preferredGrade = preferredGrades[i % preferredGrades.length];
    const preferredGenre = preferredGenres[i % preferredGenres.length];
    const preferredDescription =
      preferredDescriptions[i % preferredDescriptions.length];

    const quantity = Math.floor(Math.random() * 3) + 1;
    const initQuantity = quantity;

    listings.push({
      id: `listing-${userId}-${i + 1}`,
      sellerId: userId,
      myPhotoCardId: photo.id,
      price: Math.floor(Math.random() * 100) + 1,
      quantity,
      initQuantity,
      status: i % 2 === 0 ? "FOR_SALE" : "FOR_EXCHANGE",

      preferredGrade,
      preferredGenre,
      preferredDescription,

      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return listings;
};

export default mockListing;
