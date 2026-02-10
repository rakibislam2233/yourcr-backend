/*
  Warnings:

  - You are about to drop the column `name` on the `batches` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `institutions` table. All the data in the column will be lost.
  - Added the required column `session` to the `batches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "batches" DROP COLUMN "name",
ADD COLUMN     "group" TEXT,
ADD COLUMN     "semester" TEXT,
ADD COLUMN     "session" TEXT NOT NULL,
ADD COLUMN     "shift" TEXT;

-- AlterTable
ALTER TABLE "institutions" DROP COLUMN "isVerified",
ADD COLUMN     "establishedYear" INTEGER,
ADD COLUMN     "shortName" TEXT;
