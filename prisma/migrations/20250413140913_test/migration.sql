/*
  Warnings:

  - A unique constraint covering the columns `[account]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `account` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_account_key` ON `User`(`account`);
