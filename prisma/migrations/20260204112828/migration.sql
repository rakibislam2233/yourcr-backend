/*
  Warnings:

  - You are about to drop the column `reviewedAt` on the `cr_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedById` on the `cr_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `cr_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `currentSessionId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isCrApproved` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isCrDetailsSubmitted` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cr_registrations" DROP CONSTRAINT "cr_registrations_reviewedById_fkey";

-- DropForeignKey
ALTER TABLE "cr_registrations" DROP CONSTRAINT "cr_registrations_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_crId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "student_sessions" DROP CONSTRAINT "student_sessions_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "student_sessions" DROP CONSTRAINT "student_sessions_userId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_createdBy_fkey";

-- AlterTable
ALTER TABLE "cr_registrations" DROP COLUMN "reviewedAt",
DROP COLUMN "reviewedById",
DROP COLUMN "sessionId";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdBy",
DROP COLUMN "currentSessionId",
DROP COLUMN "isCrApproved",
DROP COLUMN "isCrDetailsSubmitted",
ADD COLUMN     "batch" TEXT,
ADD COLUMN     "crApprovedAt" TIMESTAMP(3),
ADD COLUMN     "crId" TEXT,
ADD COLUMN     "institutionId" TEXT,
ADD COLUMN     "isCr" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "program" TEXT,
ADD COLUMN     "semester" TEXT,
ADD COLUMN     "studentId" TEXT,
ADD COLUMN     "year" TEXT;

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "student_sessions";

-- DropEnum
DROP TYPE "SessionType";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_crId_fkey" FOREIGN KEY ("crId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
