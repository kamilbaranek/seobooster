import {
  AiModelMap,
  AiProvider,
  AiProviderConfig,
  ArticleDraft,
  BusinessProfile,
  GenerateArticleOptions,
  PromptOverrides,
  ScanResult,
  SeoStrategy
} from '@seobooster/ai-types';

export class MockAiProvider implements AiProvider {
  name: AiProvider['name'] = 'openai';

  constructor(
    private readonly config: AiProviderConfig,
    private readonly models: AiModelMap
  ) {}

  async scanWebsite(url: string, _overrides?: PromptOverrides<'scan'>): Promise<ScanResult> {
    return {
      url,
      title: `Scanned ${url}`,
      description: 'Mock scan result',
      keywords: ['ai', 'content', 'seo'],
      detectedTechnologies: ['next.js', 'wordpress']
    };
  }

  async analyzeBusiness(scan: ScanResult, _overrides?: PromptOverrides<'analyze'>): Promise<BusinessProfile> {
    return {
      name: new URL(scan.url).hostname,
      tagline: 'AI-powered marketing',
      mission: 'Automate SEO content',
      audience: ['SMB', 'Agencies'],
      differentiators: ['Automation', 'Quality']
    };
  }

  async buildSeoStrategy(profile: BusinessProfile, _overrides?: PromptOverrides<'strategy'>): Promise<SeoStrategy> {
    return {
      business: {
        name: profile.name,
        description: profile.mission ?? profile.tagline ?? 'Mock business description',
        target_audience: Array.isArray(profile.audience)
          ? profile.audience.join(', ')
          : profile.audience
          ? String(profile.audience)
          : 'Mock audience'
      },
      topic_clusters: [
        {
          pillar_page: `${profile.name} Growth`,
          pillar_keywords: ['keyword research', 'content automation'],
          cluster_intent: 'informational',
          funnel_stage: 'TOFU',
          supporting_articles: [
            {
              title: 'keyword research',
              keywords: ['seo tips', 'keyword planner'],
              intent: 'informational',
              funnel_stage: 'TOFU',
              meta_description: 'Mock article about keyword research.'
            },
            {
              title: 'content automation',
              keywords: ['ai articles', 'wordpress automation'],
              intent: 'commercial',
              funnel_stage: 'MOFU',
              meta_description: 'Mock article about content automation.'
            }
          ]
        }
      ],
      total_clusters: 1
    };
  }

  async generateArticle(
    strategy: SeoStrategy,
    options: GenerateArticleOptions,
    _overrides?: PromptOverrides<'article'>
  ): Promise<ArticleDraft> {
    const opportunities = (strategy.topic_clusters ?? []).flatMap(
      (cluster) => cluster.supporting_articles ?? []
    );
    const opportunity =
      opportunities.find((item) => item.title === options.clusterName) ??
      opportunities[0] ?? {
        title: 'SEO automation',
        keywords: []
      };

    return {
      title: `How to master ${opportunity.title} (${this.models.article})`,
      outline: ['Intro', 'Step 1', 'Step 2', 'CTA'],
      bodyMarkdown: '# Mock Article\n\nThis is a placeholder article.',
      keywords: opportunity.keywords,
      callToAction: 'Start your free trial'
    };
  }
}
