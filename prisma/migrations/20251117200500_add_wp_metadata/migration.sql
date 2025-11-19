-- CreateEnum
CREATE TYPE "WordpressTagsMode" AS ENUM ('AUTO_FROM_KEYWORDS', 'MANUAL_ONLY');

-- CreateTable
CREATE TABLE "WebWordpressCategory" (
  "id" TEXT NOT NULL,
  "webId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT,
  "remoteId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebWordpressCategory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WebWordpressCategory_webId_fkey" FOREIGN KEY ("webId") REFERENCES "Web"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "WebWordpressCategory_webId_remoteId_key" ON "WebWordpressCategory"("webId", "remoteId");
CREATE INDEX "WebWordpressCategory_webId_index" ON "WebWordpressCategory"("webId");

CREATE TABLE "WebWordpressAuthor" (
  "id" TEXT NOT NULL,
  "webId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT,
  "remoteId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebWordpressAuthor_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WebWordpressAuthor_webId_fkey" FOREIGN KEY ("webId") REFERENCES "Web"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "WebWordpressAuthor_webId_remoteId_key" ON "WebWordpressAuthor"("webId", "remoteId");
CREATE INDEX "WebWordpressAuthor_webId_index" ON "WebWordpressAuthor"("webId");

-- AlterTable
ALTER TABLE "Web"
  ADD COLUMN "defaultWordpressCategoryId" TEXT UNIQUE,
  ADD COLUMN "defaultWordpressAuthorId" TEXT UNIQUE,
  ADD COLUMN "wordpressTagsMode" "WordpressTagsMode" NOT NULL DEFAULT 'AUTO_FROM_KEYWORDS';

ALTER TABLE "Web"
  ADD CONSTRAINT "Web_defaultWordpressCategoryId_fkey" FOREIGN KEY ("defaultWordpressCategoryId") REFERENCES "WebWordpressCategory"("id") ON DELETE SET NULL,
  ADD CONSTRAINT "Web_defaultWordpressAuthorId_fkey" FOREIGN KEY ("defaultWordpressAuthorId") REFERENCES "WebWordpressAuthor"("id") ON DELETE SET NULL;

ALTER TABLE "Article"
  ADD COLUMN "tags" JSONB,
  ADD COLUMN "wordpressCategoryId" TEXT,
  ADD COLUMN "wordpressAuthorId" TEXT,
  ADD COLUMN "featuredImageUrl" TEXT;

ALTER TABLE "Article"
  ADD CONSTRAINT "Article_wordpressCategoryId_fkey" FOREIGN KEY ("wordpressCategoryId") REFERENCES "WebWordpressCategory"("id") ON DELETE SET NULL,
  ADD CONSTRAINT "Article_wordpressAuthorId_fkey" FOREIGN KEY ("wordpressAuthorId") REFERENCES "WebWordpressAuthor"("id") ON DELETE SET NULL;

CREATE INDEX "Article_wordpressCategoryId_index" ON "Article"("wordpressCategoryId");
CREATE INDEX "Article_wordpressAuthorId_index" ON "Article"("wordpressAuthorId");
