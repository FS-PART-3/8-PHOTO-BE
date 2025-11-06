-- CreateIndex
CREATE INDEX "History_userId_idx" ON "public"."History"("userId");

-- CreateIndex
CREATE INDEX "Listing_price_idx" ON "public"."Listing"("price");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "public"."Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_quantity_idx" ON "public"."Listing"("quantity");

-- CreateIndex
CREATE INDEX "Listing_createdAt_idx" ON "public"."Listing"("createdAt");

-- CreateIndex
CREATE INDEX "MyPhotoCard_title_idx" ON "public"."MyPhotoCard"("title");

-- CreateIndex
CREATE INDEX "MyPhotoCard_grade_idx" ON "public"."MyPhotoCard"("grade");

-- CreateIndex
CREATE INDEX "MyPhotoCard_genre_idx" ON "public"."MyPhotoCard"("genre");

-- CreateIndex
CREATE INDEX "MyPhotoCard_createdAt_idx" ON "public"."MyPhotoCard"("createdAt");
