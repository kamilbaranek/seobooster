import {
  AiModelMap,
  AiProvider,
  AiProviderConfig,
  ArticleDraft,
  BusinessProfile,
  GenerateArticleOptions,
  ScanResult,
  SeoStrategy
} from '@seobooster/ai-types';

export class MockAiProvider implements AiProvider {
  name: AiProvider['name'] = 'openai';

  constructor(
    private readonly config: AiProviderConfig,
    private readonly models: AiModelMap
  ) {}

  async scanWebsite(url: string): Promise<ScanResult> {
    return {
      url,
      title: `Scanned ${url}`,
      description: 'Mock scan result',
      keywords: ['ai', 'content', 'seo'],
      detectedTechnologies: ['next.js', 'wordpress']
    };
  }

  async analyzeBusiness(scan: ScanResult): Promise<BusinessProfile> {
    return {
      name: new URL(scan.url).hostname,
      tagline: 'AI-powered marketing',
      mission: 'Automate SEO content',
      audience: ['SMB', 'Agencies'],
      differentiators: ['Automation', 'Quality']
    };
  }

  async buildSeoStrategy(profile: BusinessProfile): Promise<SeoStrategy> {
    return {
      pillars: [
        {
          name: `${profile.name} Growth`,
          clusters: [
            { name: 'keyword research', keywords: ['seo tips', 'keyword planner'], cadenceDays: 7 },
            { name: 'content automation', keywords: ['ai articles', 'wordpress automation'], cadenceDays: 3 }
          ]
        }
      ],
      targetTone: 'Friendly'
    };
  }

  async generateArticle(strategy: SeoStrategy, options: GenerateArticleOptions): Promise<ArticleDraft> {
    const clusters = strategy.pillars.flatMap((pillar) => pillar.clusters);
    const cluster =
      clusters.find((c) => c.name === options.clusterName) ?? clusters[0] ?? { name: 'SEO automation', keywords: [] };

    return {
      title: `How to master ${cluster.name} (${this.models.article})`,
      outline: ['Intro', 'Step 1', 'Step 2', 'CTA'],
      bodyMarkdown: '# Mock Article\n\nThis is a placeholder article.',
      keywords: cluster.keywords,
      callToAction: 'Start your free trial'
    };
  }
}

