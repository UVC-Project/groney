-- DropIndex
DROP INDEX "users_emailVerificationToken_key";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "emailVerificationToken" SET DATA TYPE TEXT;
