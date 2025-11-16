-- AlterTable
ALTER TABLE "AiPromptConfig" ADD COLUMN IF NOT EXISTS "model" TEXT;
ALTER TABLE "AiPromptConfig" ADD COLUMN IF NOT EXISTS "provider" TEXT;
