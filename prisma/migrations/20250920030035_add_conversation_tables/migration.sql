-- CreateTable
CREATE TABLE "public"."conversation_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "phase" TEXT NOT NULL DEFAULT 'initial',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "collectedInfo" JSONB NOT NULL DEFAULT '{}',
    "context" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "conversation_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversation_messages" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "suggestions" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."generated_surveys" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "questions" JSONB NOT NULL,
    "prompt" TEXT NOT NULL,
    "aiProvider" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "generationMetadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversation_sessions_sessionId_key" ON "public"."conversation_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "conversation_sessions_userId_idx" ON "public"."conversation_sessions"("userId");

-- CreateIndex
CREATE INDEX "conversation_sessions_sessionId_idx" ON "public"."conversation_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "conversation_sessions_status_idx" ON "public"."conversation_sessions"("status");

-- CreateIndex
CREATE INDEX "conversation_messages_sessionId_idx" ON "public"."conversation_messages"("sessionId");

-- CreateIndex
CREATE INDEX "conversation_messages_createdAt_idx" ON "public"."conversation_messages"("createdAt");

-- CreateIndex
CREATE INDEX "generated_surveys_sessionId_idx" ON "public"."generated_surveys"("sessionId");

-- CreateIndex
CREATE INDEX "generated_surveys_userId_idx" ON "public"."generated_surveys"("userId");

-- AddForeignKey
ALTER TABLE "public"."conversation_sessions" ADD CONSTRAINT "conversation_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_messages" ADD CONSTRAINT "conversation_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."conversation_sessions"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."generated_surveys" ADD CONSTRAINT "generated_surveys_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."conversation_sessions"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."generated_surveys" ADD CONSTRAINT "generated_surveys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
