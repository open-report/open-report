import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseBibtex } from './bibtex';
import { type CitationAssets, formatCitations, type StyleId } from './engine';

const stylesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'styles',
);
const read = (f: string) => readFileSync(join(stylesDir, f), 'utf8');

const STYLE_FILE: Record<StyleId, string> = {
  apa: 'apa.csl',
  gb7714: 'gb-7714-2015-numeric.csl',
};

const locales = {
  'en-US': read('locales-en-US.xml'),
  'zh-TW': read('locales-zh-TW.xml'),
};

const assets = (style: StyleId): CitationAssets => ({
  styleXml: read(STYLE_FILE[style]),
  locales,
});

const BIB = `
  @article{lecun2015,
    title   = {Deep learning},
    author  = {LeCun, Yann and Bengio, Yoshua and Hinton, Geoffrey},
    journal = {Nature},
    volume  = {521},
    pages   = {436--444},
    year    = {2015}
  }
  @inproceedings{krizhevsky2012,
    title     = {ImageNet classification with deep convolutional neural networks},
    author    = {Krizhevsky, Alex and Sutskever, Ilya and Hinton, Geoffrey E},
    booktitle = {Advances in Neural Information Processing Systems},
    volume    = {25},
    year      = {2012}
  }
`;

const items = parseBibtex(BIB);

describe('formatCitations — APA', () => {
  const result = formatCitations({
    items,
    citedIdsInOrder: ['lecun2015', 'krizhevsky2012'],
    assets: assets('apa'),
    lang: 'en',
  });

  it('renders author-date inline citations', () => {
    expect(result.inline.lecun2015).toContain('LeCun');
    expect(result.inline.lecun2015).toContain('2015');
    // three authors -> et al. in APA in-text
    expect(result.inline.lecun2015).toContain('et al.');
    expect(result.inline.lecun2015).toMatch(/\(.*2015\)/);
  });

  it('builds a bibliography with only cited entries', () => {
    expect(result.bibliographyHtml).toContain('Deep learning');
    expect(result.bibliographyHtml).toContain('ImageNet');
    expect(result.bibliographyHtml).toContain('csl-entry');
  });

  it('reports no missing ids when all are present', () => {
    expect(result.missing).toEqual([]);
  });
});

describe('formatCitations — GB/T 7714 numeric', () => {
  const result = formatCitations({
    items,
    citedIdsInOrder: ['lecun2015', 'krizhevsky2012'],
    assets: assets('gb7714'),
    lang: 'zh-TW',
  });

  it('numbers citations in order of first appearance (superscript per GB/T 7714)', () => {
    expect(result.inline.lecun2015).toBe('<sup>[1]</sup>');
    expect(result.inline.krizhevsky2012).toBe('<sup>[2]</sup>');
  });

  it('produces a numbered bibliography', () => {
    expect(result.bibliographyHtml).toContain('Deep learning');
    expect(result.bibliographyHtml).toContain('csl-entry');
  });
});

describe('formatCitations — missing ids', () => {
  it('collects ids absent from the bibliography', () => {
    const result = formatCitations({
      items,
      citedIdsInOrder: ['lecun2015', 'ghost2099'],
      assets: assets('apa'),
      lang: 'en',
    });
    expect(result.missing).toEqual(['ghost2099']);
    expect(result.inline.ghost2099).toBeUndefined();
    expect(result.inline.lecun2015).toBeDefined();
  });
});
