-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS', 'OTHER');

-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "platform" "Platform" NOT NULL DEFAULT 'ZOOM';
