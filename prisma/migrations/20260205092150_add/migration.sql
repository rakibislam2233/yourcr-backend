/*
  Warnings:

  - Added the required column `createdBy` to the `batches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "batches" ADD COLUMN     "createdBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currentBatchId" TEXT;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_currentBatchId_fkey" FOREIGN KEY ("currentBatchId") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
