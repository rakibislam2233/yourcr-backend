-- AlterTable
ALTER TABLE "batch_enrollments" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "batches" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "institutions" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
