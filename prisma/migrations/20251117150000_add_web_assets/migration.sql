-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "Web"
  ADD COLUMN "faviconUrl" TEXT,
  ADD COLUMN "faviconSourceUrl" TEXT,
  ADD COLUMN "faviconStatus" "AssetStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "faviconLastFetchedAt" TIMESTAMP(3),
  ADD COLUMN "screenshotUrl" TEXT,
  ADD COLUMN "screenshotStatus" "AssetStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "screenshotLastGeneratedAt" TIMESTAMP(3),
  ADD COLUMN "screenshotWidth" INTEGER,
  ADD COLUMN "screenshotHeight" INTEGER;
