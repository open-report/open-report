import { describe, expect, it } from 'vitest';
import { parseBibtex } from './bibtex';

describe('parseBibtex', () => {
  it('parses an @article with "Family, Given" authors', () => {
    const [item] = parseBibtex(`
      @article{lecun2015,
        title   = {Deep learning},
        author  = {LeCun, Yann and Bengio, Yoshua and Hinton, Geoffrey},
        journal = {Nature},
        volume  = {521},
        pages   = {436--444},
        year    = {2015}
      }
    `);
    expect(item).toMatchObject({
      id: 'lecun2015',
      type: 'article-journal',
      title: 'Deep learning',
      'container-title': 'Nature',
      volume: '521',
      page: '436–444',
      issued: { 'date-parts': [[2015]] },
    });
    expect(item?.author).toEqual([
      { family: 'LeCun', given: 'Yann' },
      { family: 'Bengio', given: 'Yoshua' },
      { family: 'Hinton', given: 'Geoffrey' },
    ]);
  });

  it('maps @inproceedings to paper-conference and booktitle to container-title', () => {
    const [item] = parseBibtex(`
      @inproceedings{krizhevsky2012,
        title     = {ImageNet classification with deep convolutional neural networks},
        author    = {Krizhevsky, Alex and Sutskever, Ilya and Hinton, Geoffrey E},
        booktitle = {Advances in Neural Information Processing Systems},
        volume    = {25},
        year      = {2012}
      }
    `);
    expect(item?.type).toBe('paper-conference');
    expect(item?.['container-title']).toBe(
      'Advances in Neural Information Processing Systems',
    );
  });

  it('parses "Given Family" author form', () => {
    const [item] = parseBibtex(
      '@book{a, author = {Donald Knuth}, year = {1968}}',
    );
    expect(item?.author).toEqual([{ family: 'Knuth', given: 'Donald' }]);
  });

  it('treats a brace-wrapped author as an institution literal', () => {
    const [item] = parseBibtex(
      '@misc{who, author = {{World Health Organization}}, year = {2020}}',
    );
    expect(item?.author).toEqual([{ literal: 'World Health Organization' }]);
  });

  it('handles quoted values and strips protective inner braces', () => {
    const [item] = parseBibtex(
      '@article{x, title = "A study of {DNA}", journal = {Cell}, year = {1990}}',
    );
    expect(item?.title).toBe('A study of DNA');
    expect(item?.['container-title']).toBe('Cell');
  });

  it('skips @comment/@string blocks and malformed entries without throwing', () => {
    const items = parseBibtex(`
      @comment{ this is ignored }
      @string{ pub = "ACM" }
      @article{good, title = {Fine}, year = {2001}}
    `);
    expect(items.map((i) => i.id)).toEqual(['good']);
  });

  it('returns an empty array for empty input', () => {
    expect(parseBibtex('')).toEqual([]);
  });
});
