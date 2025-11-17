-- Set WebAnalysis.webId foreign key to ON DELETE CASCADE
ALTER TABLE "WebAnalysis" DROP CONSTRAINT IF EXISTS "WebAnalysis_webId_fkey";
ALTER TABLE "WebAnalysis" ADD CONSTRAINT "WebAnalysis_webId_fkey" FOREIGN KEY ("webId") REFERENCES "Web"("id") ON DELETE CASCADE ON UPDATE CASCADE;
