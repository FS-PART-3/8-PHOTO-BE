const mockTransaction = (users, listings, count = 30) => {
  const transactions = [];

  for (let i = 0; i < count; i++) {
    const buyer = users[i % users.length];
    const listing = listings[i % listings.length];

    transactions.push({
      id: `txn-${buyer.id}-${i + 1}`,
      buyerId: buyer.id,
      listingId: listing.id,
      totalAmount:
        listing.price * (Math.floor(Math.random() * listing.quantity) + 1),
      quantity: Math.floor(Math.random() * listing.quantity) + 1,
      createdAt: new Date(),
    });
  }

  return transactions;
};

export default mockTransaction;
