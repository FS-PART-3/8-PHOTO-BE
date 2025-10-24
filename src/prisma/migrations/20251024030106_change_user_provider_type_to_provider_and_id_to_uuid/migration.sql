/*
  Warnings:

  - You are about to drop the column `providerType` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "providerType",
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'local',
ALTER COLUMN "refreshToken" DROP NOT NULL;

-- DropEnum
DROP TYPE "public"."ProviderType";
