import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';

type HeadingNode = {
  depth: number;
};

const enforceSingleH1 = () => (tree: unknown) => {
  let seenFirstH1 = false;
  visit(tree as never, 'heading', (node) => {
    const heading = node as HeadingNode;
    if (heading.depth === 1) {
      if (!seenFirstH1) {
        seenFirstH1 = true;
        return;
      }
      heading.depth = 2;
    }
  });
};

const buildProcessor = () =>
  remark()
    .use(remarkParse)
    .use(remarkGfm)
    .use(enforceSingleH1)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeExternalLinks, {
      target: '_blank',
      rel: ['noopener', 'noreferrer']
    })
    .use(rehypeStringify);

export const renderArticleMarkdown = async (markdown: string): Promise<string> => {
  if (typeof markdown !== 'string') {
    throw new TypeError('renderArticleMarkdown expects a string as markdown input');
  }
  const trimmed = markdown.trim();
  if (trimmed.length === 0) {
    return '';
  }

  const processor = buildProcessor();
  const result = await processor.process(trimmed);
  return String(result);
};
