/*
  Warnings:

  - You are about to drop the column `isCrDetailsSubmitted` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "isCrDetailsSubmitted",
ADD COLUMN     "isRegistrationComplete" BOOLEAN NOT NULL DEFAULT false;
