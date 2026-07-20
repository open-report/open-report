import CSL from 'citeproc';
import type { CslItem } from './bibtex';

export type StyleId = 'apa' | 'gb7714';

/** XML assets required to format citations, all pre-loaded as strings. */
export type CitationAssets = {
  /** The CSL style XML for the chosen style. */
  styleXml: string;
  /** Locale XML keyed by CSL locale code (e.g. `en-US`, `zh-TW`). */
  locales: Record<string, string>;
};

export type FormattedCitations = {
  /** Cited id -> rendered inline citation HTML, e.g. `(LeCun et al., 2015)` or `[1]`. */
  inline: Record<string, string>;
  /** Ids referenced by a `<Cite>` that were not found in the bibliography. */
  missing: string[];
  /** Full bibliography markup (only the entries that were actually cited). */
  bibliographyHtml: string;
};

/** Reduce a document lang to a CSL locale we ship. */
export function normalizeLocale(lang?: string): 'zh-TW' | 'en-US' {
  return lang?.toLowerCase().startsWith('zh') ? 'zh-TW' : 'en-US';
}

/**
 * Format a document's citations with citeproc.
 *
 * `citedIdsInOrder` drives numbering for numeric styles (GB/T 7714): the first
 * time an id appears fixes its number. Author-date styles (APA) ignore order.
 * Only cited entries are included in the bibliography, sorted by the style.
 */
export function formatCitations(opts: {
  items: CslItem[];
  citedIdsInOrder: string[];
  assets: CitationAssets;
  lang?: string;
}): FormattedCitations {
  const { items, citedIdsInOrder, assets, lang } = opts;

  const itemMap: Record<string, CslItem> = {};
  for (const it of items) itemMap[it.id] = it;

  const locale = normalizeLocale(lang);
  const sys = {
    retrieveLocale: (l: string) =>
      assets.locales[l] ??
      (l.toLowerCase().startsWith('zh')
        ? assets.locales['zh-TW']
        : assets.locales['en-US']) ??
      assets.locales['en-US'],
    retrieveItem: (id: string) => itemMap[id],
  };

  // forceLang=true pins the locale to the report's language regardless of the
  // style's default-locale (GB/T 7714 defaults to zh-CN, which we don't ship).
  const engine = new CSL.Engine(sys, assets.styleXml, locale, true);

  const seen = new Set<string>();
  const orderedCited: string[] = [];
  const missing: string[] = [];
  for (const id of citedIdsInOrder) {
    if (seen.has(id)) continue;
    seen.add(id);
    if (itemMap[id]) orderedCited.push(id);
    else missing.push(id);
  }

  engine.updateItems(orderedCited);

  const inline: Record<string, string> = {};
  for (const id of orderedCited) {
    inline[id] = engine.makeCitationCluster([{ id }]);
  }

  let bibliographyHtml = '';
  const bib = engine.makeBibliography();
  if (bib) {
    const [meta, entries] = bib;
    bibliographyHtml = meta.bibstart + entries.join('') + meta.bibend;
  }

  return { inline, missing, bibliographyHtml };
}
