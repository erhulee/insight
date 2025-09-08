/*
  Warnings:

  - You are about to drop the column `temperature` on the `AIConfig` table. All the data in the column will be lost.
  - You are about to drop the column `topP` on the `AIConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."AIConfig" DROP COLUMN "temperature",
DROP COLUMN "topP";
