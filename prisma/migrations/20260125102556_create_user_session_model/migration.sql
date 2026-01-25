/*
  Warnings:

  - You are about to drop the `FileUpload` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Otp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FileUpload" DROP CONSTRAINT "FileUpload_userId_fkey";

-- DropForeignKey
ALTER TABLE "Otp" DROP CONSTRAINT "Otp_userId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropTable
DROP TABLE "FileUpload";

-- DropTable
DROP TABLE "Otp";

-- DropTable
DROP TABLE "RefreshToken";

-- DropTable
DROP TABLE "User";
