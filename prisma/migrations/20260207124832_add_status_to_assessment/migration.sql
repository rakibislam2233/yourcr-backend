-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'LATE', 'MISSING');

-- AlterTable
ALTER TABLE "assessment_submissions" ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED';

-- AlterTable
ALTER TABLE "assessments" ADD COLUMN     "status" "AssessmentStatus" NOT NULL DEFAULT 'SCHEDULED';
