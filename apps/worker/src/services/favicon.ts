import { load } from 'cheerio';
import { fetch } from 'undici';
import sharp from 'sharp';
import type { Logger } from 'pino';
import type { AssetStorage } from '@seobooster/storage';

const USER_AGENT =
  'Mozilla/5.0 (compatible; SEOBoosterBot/1.0; +https://seobooster.app/worker)';
const FAVICON_SIZES = [16, 32, 64] as const;

const fetchWithTimeout = async (url: string, timeoutMs: number, type: 'text' | 'binary') => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    if (type === 'text') {
      return response.text();
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } finally {
    clearTimeout(timeout);
  }
};

const resolveUrl = (baseUrl: string, href: string) => {
  try {
    return new URL(href, baseUrl).toString();
  } catch (_error) {
    return null;
  }
};

const parseSize = (value?: string | null) => {
  if (!value) return 0;
  if (value === 'any') return 512;
  const firstPair = value.split(/\s+/)[0];
  const [width] = firstPair.split('x').map((part) => Number.parseInt(part, 10));
  return Number.isFinite(width) ? width : 0;
};

const formatScore = (typeAttr?: string | null) => {
  if (!typeAttr) return 0;
  if (typeAttr.includes('svg')) return 40;
  if (typeAttr.includes('png')) return 30;
  if (typeAttr.includes('jpeg') || typeAttr.includes('jpg')) return 20;
  if (typeAttr.includes('ico')) return 10;
  return 0;
};

const relScore = (relAttr: string) => {
  if (relAttr.includes('apple-touch-icon')) return 35;
  if (relAttr.includes('shortcut')) return 25;
  if (relAttr.includes('mask-icon')) return 20;
  if (relAttr.includes('icon')) return 15;
  return 0;
};

type Candidate = {
  url: string;
  declaredSize: number;
  formatScore: number;
  relScore: number;
  order: number;
};

const collectFaviconCandidates = (websiteUrl: string, html: string) => {
  const $ = load(html);
  const map = new Map<string, Candidate>();
  $('link[rel]').each((index, element) => {
    const rel = ($(element).attr('rel') ?? '').toLowerCase();
    if (!rel.includes('icon')) {
      return;
    }
    const href = $(element).attr('href');
    if (!href) {
      return;
    }
    const resolved = resolveUrl(websiteUrl, href);
    if (!resolved) {
      return;
    }
    const sizesAttr = $(element).attr('sizes');
    const typeAttr = $(element).attr('type') ?? '';
    map.set(resolved, {
      url: resolved,
      declaredSize: parseSize(sizesAttr),
      formatScore: formatScore(typeAttr.toLowerCase()),
      relScore: relScore(rel),
      order: index
    });
  });

  const defaultFavicon = resolveUrl(websiteUrl, '/favicon.ico');
  if (defaultFavicon && !map.has(defaultFavicon)) {
    map.set(defaultFavicon, {
      url: defaultFavicon,
      declaredSize: 32,
      formatScore: 5,
      relScore: 10,
      order: 9999
    });
  }

  return Array.from(map.values()).sort((a, b) => {
    const scoreA = a.declaredSize * 2 + a.formatScore + a.relScore - a.order * 0.01;
    const scoreB = b.declaredSize * 2 + b.formatScore + b.relScore - b.order * 0.01;
    return scoreB - scoreA;
  });
};

const resizeForAllVariants = async (input: Buffer) => {
  const entries = await Promise.all(
    FAVICON_SIZES.map(async (size) => {
      const resized = await sharp(input)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toBuffer();
      return [size, resized] as const;
    })
  );
  return new Map(entries);
};

const FALLBACK_COLORS = ['#2563eb', '#7c3aed', '#0ea5e9', '#059669', '#d946ef', '#f97316'];

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const buildFallbackSvg = (label: string, color: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="12" fill="${color}" />
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-size="32" font-family="Inter, Arial, sans-serif" font-weight="600">${label}</text>
</svg>`;

const generateFallback = async (websiteUrl: string) => {
  let label = 'S';
  let seed = 'fallback';
  try {
    const hostname = new URL(websiteUrl).hostname.replace('www.', '');
    seed = hostname;
    label = hostname.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase() || 'S';
  } catch (_error) {
    // ignore parsing errors, keep defaults
  }
  const color = FALLBACK_COLORS[hashString(seed) % FALLBACK_COLORS.length];
  const svg = buildFallbackSvg(label, color);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return { buffer: png, source: 'fallback:generated' } as const;
};

export type FaviconResult = {
  url: string;
  sourceUrl: string;
  isFallback: boolean;
};

export const fetchAndStoreFavicon = async (
  webId: string,
  websiteUrl: string,
  storage: AssetStorage,
  logger: Logger
): Promise<FaviconResult> => {
  let html: string;
  try {
    html = await fetchWithTimeout(websiteUrl, 12000, 'text') as string;
  } catch (error) {
    logger.warn({ webId, error }, 'Failed to fetch homepage HTML, using fallback favicon');
    const fallback = await generateFallback(websiteUrl);
    const variants = await resizeForAllVariants(fallback.buffer);
    let canonicalUrl = '';
    for (const [size, buffer] of variants.entries()) {
      canonicalUrl = await storage.saveFile(
        `projects/${webId}/favicon-${size}.png`,
        buffer,
        'image/png'
      );
    }
    return { url: canonicalUrl, sourceUrl: fallback.source, isFallback: true };
  }

  const candidates = collectFaviconCandidates(websiteUrl, html);
  for (const candidate of candidates) {
    try {
      const buffer = (await fetchWithTimeout(candidate.url, 12000, 'binary')) as Buffer;
      const variants = await resizeForAllVariants(buffer);
      let canonicalUrl = '';
      for (const [size, resized] of variants.entries()) {
        canonicalUrl = await storage.saveFile(
          `projects/${webId}/favicon-${size}.png`,
          resized,
          'image/png'
        );
      }
      return { url: canonicalUrl, sourceUrl: candidate.url, isFallback: false };
    } catch (error) {
      logger.warn({ webId, candidate: candidate.url, error }, 'Failed to process favicon candidate');
    }
  }

  logger.warn({ webId }, 'No valid favicon candidates found, using fallback');
  const fallback = await generateFallback(websiteUrl);
  const variants = await resizeForAllVariants(fallback.buffer);
  let canonicalUrl = '';
  for (const [size, buffer] of variants.entries()) {
    canonicalUrl = await storage.saveFile(
      `projects/${webId}/favicon-${size}.png`,
      buffer,
      'image/png'
    );
  }
  return { url: canonicalUrl, sourceUrl: fallback.source, isFallback: true };
};
