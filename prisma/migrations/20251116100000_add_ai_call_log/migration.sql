CREATE TABLE IF NOT EXISTS "AiCallLog" (
    "id" TEXT NOT NULL,
    "webId" TEXT,
    "task" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variables" JSONB,
    "systemPrompt" TEXT NOT NULL,
    "userPrompt" TEXT NOT NULL,
    "responseRaw" JSONB,
    "responseParsed" JSONB,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiCallLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AiCallLog_webId_fkey'
  ) THEN
    ALTER TABLE "AiCallLog" ADD CONSTRAINT "AiCallLog_webId_fkey" FOREIGN KEY ("webId") REFERENCES "Web"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;
