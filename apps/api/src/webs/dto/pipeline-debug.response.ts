export interface PipelineDebugResponse {
  scanResult: unknown;
  businessProfile: unknown;
  seoStrategy: unknown;
  latestArticle: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
  } | null;
  rawScanOutput?: string | null;
}
