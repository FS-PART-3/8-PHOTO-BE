-- AlterTable
ALTER TABLE "public"."ExchangeOffer" ADD COLUMN     "offeredPhotoId" TEXT;

-- AlterTable
ALTER TABLE "public"."MyPhotoCard" ADD COLUMN     "watermarkUrl" TEXT;

-- AddForeignKey
ALTER TABLE "public"."ExchangeOffer" ADD CONSTRAINT "ExchangeOffer_offeredPhotoId_fkey" FOREIGN KEY ("offeredPhotoId") REFERENCES "public"."MyPhotoCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
