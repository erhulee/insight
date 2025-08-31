-- DropForeignKey
ALTER TABLE "public"."RenderConfig" DROP CONSTRAINT "RenderConfig_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."RenderTemplate" DROP CONSTRAINT "RenderTemplate_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."Survey" DROP CONSTRAINT "Survey_ownerId_fkey";

-- AlterTable
ALTER TABLE "public"."Survey" ADD COLUMN     "bottomNotice" TEXT,
ADD COLUMN     "coverColor" TEXT,
ADD COLUMN     "coverConfig" JSONB,
ADD COLUMN     "coverDescription" TEXT,
ADD COLUMN     "coverIcon" TEXT,
ADD COLUMN     "estimatedTime" TEXT,
ADD COLUMN     "privacyNotice" TEXT,
ADD COLUMN     "showPrivacyNotice" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showProgressInfo" BOOLEAN NOT NULL DEFAULT true;
