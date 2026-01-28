/*
  Warnings:

  - You are about to drop the column `addressId` on the `institutions` table. All the data in the column will be lost.
  - You are about to drop the `addresses` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `address` to the `institutions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "institutions" DROP CONSTRAINT "institutions_addressId_fkey";

-- AlterTable
ALTER TABLE "institutions" DROP COLUMN "addressId",
ADD COLUMN     "address" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isCrApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isCrDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "addresses";
