-- CreateEnum
CREATE TYPE "ArticlePlanStatus" AS ENUM ('PLANNED', 'QUEUED', 'GENERATED', 'PUBLISHED', 'SKIPPED');

-- CreateTable
CREATE TABLE "SeoStrategy" (
    "id" TEXT NOT NULL,
    "webId" TEXT NOT NULL,
    "model" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawJson" JSONB,
    "businessName" TEXT,
    "businessDescription" TEXT,
    "businessTargetAudience" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoTopicCluster" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "pillarPage" TEXT NOT NULL,
    "pillarKeywords" JSONB NOT NULL,
    "clusterIntent" TEXT NOT NULL,
    "funnelStage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoTopicCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoSupportingArticle" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "keywords" JSONB NOT NULL,
    "intent" TEXT NOT NULL,
    "funnelStage" TEXT NOT NULL,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoSupportingArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticlePlan" (
    "id" TEXT NOT NULL,
    "webId" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "supportingArticleId" TEXT NOT NULL,
    "articleId" TEXT,
    "plannedPublishAt" TIMESTAMP(3) NOT NULL,
    "status" "ArticlePlanStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticlePlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SeoStrategy_webId_isActive_idx" ON "SeoStrategy"("webId", "isActive");

-- CreateIndex
CREATE INDEX "SeoTopicCluster_strategyId_orderIndex_idx" ON "SeoTopicCluster"("strategyId", "orderIndex");

-- CreateIndex
CREATE INDEX "SeoSupportingArticle_clusterId_orderIndex_idx" ON "SeoSupportingArticle"("clusterId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "ArticlePlan_articleId_key" ON "ArticlePlan"("articleId");

-- CreateIndex
CREATE INDEX "ArticlePlan_webId_plannedPublishAt_idx" ON "ArticlePlan"("webId", "plannedPublishAt");

-- CreateIndex
CREATE INDEX "ArticlePlan_strategyId_idx" ON "ArticlePlan"("strategyId");

-- CreateIndex
CREATE INDEX "ArticlePlan_status_plannedPublishAt_idx" ON "ArticlePlan"("status", "plannedPublishAt");

-- AddForeignKey
ALTER TABLE "SeoStrategy" ADD CONSTRAINT "SeoStrategy_webId_fkey" FOREIGN KEY ("webId") REFERENCES "Web"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoTopicCluster" ADD CONSTRAINT "SeoTopicCluster_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "SeoStrategy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoSupportingArticle" ADD CONSTRAINT "SeoSupportingArticle_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "SeoTopicCluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticlePlan" ADD CONSTRAINT "ArticlePlan_webId_fkey" FOREIGN KEY ("webId") REFERENCES "Web"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticlePlan" ADD CONSTRAINT "ArticlePlan_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "SeoStrategy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticlePlan" ADD CONSTRAINT "ArticlePlan_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "SeoTopicCluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticlePlan" ADD CONSTRAINT "ArticlePlan_supportingArticleId_fkey" FOREIGN KEY ("supportingArticleId") REFERENCES "SeoSupportingArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticlePlan" ADD CONSTRAINT "ArticlePlan_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

