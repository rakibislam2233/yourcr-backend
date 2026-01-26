/*
  Warnings:

  - The values [PENDING,APPROVED,REJECTED] on the enum `CRRegistrationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [COLLEGE,POLYTECHNIC,UNIVERSITY] on the enum `InstitutionType` will be removed. If these variants are still used in the database, this will fail.
  - The values [SEMESTER,YEAR] on the enum `SessionType` will be removed. If these variants are still used in the database, this will fail.
  - The values [SUPER_ADMIN,ADMIN,CR,STUDENT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACTIVE,INACTIVE,BLOCKED,BANNED] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CRRegistrationStatus_new" AS ENUM ('pending', 'approved', 'rejected');
ALTER TABLE "public"."CRRegistration" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "CRRegistration" ALTER COLUMN "status" TYPE "CRRegistrationStatus_new" USING ("status"::text::"CRRegistrationStatus_new");
ALTER TYPE "CRRegistrationStatus" RENAME TO "CRRegistrationStatus_old";
ALTER TYPE "CRRegistrationStatus_new" RENAME TO "CRRegistrationStatus";
DROP TYPE "public"."CRRegistrationStatus_old";
ALTER TABLE "CRRegistration" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "InstitutionType_new" AS ENUM ('college', 'polytechnic', 'university');
ALTER TABLE "institutions" ALTER COLUMN "type" TYPE "InstitutionType_new" USING ("type"::text::"InstitutionType_new");
ALTER TYPE "InstitutionType" RENAME TO "InstitutionType_old";
ALTER TYPE "InstitutionType_new" RENAME TO "InstitutionType";
DROP TYPE "public"."InstitutionType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SessionType_new" AS ENUM ('semester', 'year');
ALTER TABLE "Session" ALTER COLUMN "sessionType" TYPE "SessionType_new" USING ("sessionType"::text::"SessionType_new");
ALTER TYPE "SessionType" RENAME TO "SessionType_old";
ALTER TYPE "SessionType_new" RENAME TO "SessionType";
DROP TYPE "public"."SessionType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('super_admin', 'admin', 'cr', 'student');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('active', 'inactive', 'blocked', 'banned');
ALTER TABLE "public"."users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'active';
COMMIT;

-- AlterTable
ALTER TABLE "CRRegistration" ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student',
ALTER COLUMN "status" SET DEFAULT 'active';
