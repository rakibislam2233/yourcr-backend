/*
  Warnings:

  - You are about to drop the `CRRegistration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CRRegistration" DROP CONSTRAINT "CRRegistration_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "CRRegistration" DROP CONSTRAINT "CRRegistration_reviewedById_fkey";

-- DropForeignKey
ALTER TABLE "CRRegistration" DROP CONSTRAINT "CRRegistration_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "CRRegistration" DROP CONSTRAINT "CRRegistration_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_crId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_institutionId_fkey";

-- DropTable
DROP TABLE "CRRegistration";

-- DropTable
DROP TABLE "Session";

-- CreateTable
CREATE TABLE "cr_registrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "documentProof" TEXT NOT NULL,
    "status" "CRRegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cr_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sessionType" "SessionType" NOT NULL,
    "department" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "crId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cr_registrations" ADD CONSTRAINT "cr_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cr_registrations" ADD CONSTRAINT "cr_registrations_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cr_registrations" ADD CONSTRAINT "cr_registrations_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cr_registrations" ADD CONSTRAINT "cr_registrations_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_crId_fkey" FOREIGN KEY ("crId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
