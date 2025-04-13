/*
  Warnings:

  - You are about to drop the column `userId` on the `Survey` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Survey` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Survey` DROP FOREIGN KEY `Survey_userId_fkey`;

-- DropIndex
DROP INDEX `Survey_userId_fkey` ON `Survey`;

-- AlterTable
ALTER TABLE `Survey` DROP COLUMN `userId`,
    ADD COLUMN `ownerId` VARCHAR(191) NOT NULL;
