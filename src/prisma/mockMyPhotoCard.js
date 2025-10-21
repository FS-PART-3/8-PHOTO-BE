const mockMyPhotoCard = (userId, count = 100) => {
  const photoName = ["스페인 여행", "우리집 앞마당", "How Far I'll Go"];
  const photoGrade = ["COMMON", "RARE", "SUPERRARE", "LEGENDARY"];
  const photoGenre = ["풍경", "인물", "도시", "자연"];
  const photoImages = ["photo_1.svg", "photo_2.svg", "photo_3.svg"];

  const photoCards = [];

  for (let i = 0; i < count; i++) {
    const title = photoName[i % photoName.length];
    const grade = photoGrade[i % photoGrade.length];
    const genre = photoGenre[i % photoGenre.length];
    const imgUrl = photoImages[i % photoImages.length];

    photoCards.push({
      id: `photo-${userId}-${i + 1}`,
      userId,
      title,
      grade,
      genre,
      price: Math.floor(Math.random() * 100) + 1,
      quantity: Math.floor(Math.random() * 10) + 1,
      imgUrl: `images/${imgUrl}`,
      description: `${grade} 등급의 ${genre} 테마 카드입니다.`,

      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return photoCards;
};

export default mockMyPhotoCard;
