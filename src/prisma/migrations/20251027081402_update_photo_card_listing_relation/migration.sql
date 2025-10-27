/*
  Warnings:

  - You are about to drop the column `myPhotoCardId` on the `Listing` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Listing" DROP CONSTRAINT "Listing_myPhotoCardId_fkey";

-- AlterTable
ALTER TABLE "public"."Listing" DROP COLUMN "myPhotoCardId";

-- CreateTable
CREATE TABLE "public"."_PhotoCardListings" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PhotoCardListings_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PhotoCardListings_B_index" ON "public"."_PhotoCardListings"("B");

-- AddForeignKey
ALTER TABLE "public"."_PhotoCardListings" ADD CONSTRAINT "_PhotoCardListings_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PhotoCardListings" ADD CONSTRAINT "_PhotoCardListings_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."MyPhotoCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
