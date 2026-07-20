import { expect, test } from 'vitest';
import { parseFrontmatter } from './frontmatter';

test('parses simple key-value front-matter', () => {
  const meta = parseFrontmatter(
    '---\ntitle: My report\nauthor: Yoga\n---\n\n# Hi',
  );
  expect(meta).toEqual({ title: 'My report', author: 'Yoga' });
});

test('strips quotes and ignores malformed lines', () => {
  const meta = parseFrontmatter(
    "---\ntitle: 'Quoted'\nnocolon\nlang: zh-TW\n---",
  );
  expect(meta).toEqual({ title: 'Quoted', lang: 'zh-TW' });
});

test('returns empty object without front-matter', () => {
  expect(parseFrontmatter('# Just a heading')).toEqual({});
});
