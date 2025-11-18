import { describe, expect, it } from 'vitest';
import { renderArticleMarkdown } from '../src';

const sampleMarkdown = `
# Title

# Duplicate H1

## Section

This is a paragraph.

- List item one
- List item two

Visit [External Website](https://example.com) for more info.
`;

describe('renderArticleMarkdown', () => {
  it('converts markdown to HTML with normalized headings', async () => {
    const html = await renderArticleMarkdown(sampleMarkdown);
    const h1Count = (html.match(/<h1\b/g) ?? []).length;
    expect(h1Count).toBe(1);
    expect(html).toContain('<h2');
    expect(html).toContain('<ul>');
    expect(html).toContain('<a href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('returns empty string for whitespace-only input', async () => {
    await expect(renderArticleMarkdown('   \n')).resolves.toBe('');
  });
});
