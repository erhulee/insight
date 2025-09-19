-- AlterTable
ALTER TABLE "public"."AIConfig" ADD COLUMN     "modelSize" BIGINT;

-- CreateTable
CREATE TABLE "public"."active_model_config" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "modelSize" BIGINT,
    "modelType" TEXT NOT NULL DEFAULT 'ollama',
    "baseUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "active_model_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "active_model_config_userId_modelType_key" ON "public"."active_model_config"("userId", "modelType");

-- AddForeignKey
ALTER TABLE "public"."active_model_config" ADD CONSTRAINT "active_model_config_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
