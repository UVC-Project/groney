/*
  Warnings:

  - You are about to drop the column `activeClassId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `PasswordResetToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_userId_fkey";

-- DropIndex
DROP INDEX "users_activeClassId_idx";

-- DropIndex
DROP INDEX "users_classId_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "activeClassId",
DROP COLUMN "classId";

-- DropTable
DROP TABLE "PasswordResetToken";
