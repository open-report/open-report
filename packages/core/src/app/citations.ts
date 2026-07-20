// Browser-side glue between a report and the citeproc engine. The vendored CSL
// styles and locales are inlined at build time via Vite `?raw` imports so the
// preview needs no network access.
import apaCsl from '../../styles/apa.csl?raw';
import gbCsl from '../../styles/gb-7714-2015-numeric.csl?raw';
import enUS from '../../styles/locales-en-US.xml?raw';
import zhTW from '../../styles/locales-zh-TW.xml?raw';
import {
  type CitationAssets,
  type FormattedCitations,
  formatCitations,
  parseBibtex,
  type StyleId,
} from '../bib';

const STYLE_XML: Record<StyleId, string> = { apa: apaCsl, gb7714: gbCsl };

const LOCALES: CitationAssets['locales'] = {
  'en-US': enUS,
  'zh-TW': zhTW,
};

/** Map a front-matter citationStyle to a style we ship (fallback: APA). */
export function resolveStyleId(meta: Record<string, string>): StyleId {
  const style = meta.citationStyle?.toLowerCase();
  if (style === 'gb7714') return 'gb7714';
  if (style && style !== 'apa') {
    console.warn(
      `[open-report] citationStyle "${style}" is not bundled yet; falling back to APA.`,
    );
  }
  return 'apa';
}

/**
 * Format all citations for a report.
 *
 * @param citedIdsInOrder ids in document order (drives numeric style numbering).
 */
export function computeCitations(
  meta: Record<string, string>,
  bib: string,
  citedIdsInOrder: string[],
): FormattedCitations {
  const items = parseBibtex(bib ?? '');
  const styleId = resolveStyleId(meta);
  return formatCitations({
    items,
    citedIdsInOrder,
    assets: { styleXml: STYLE_XML[styleId], locales: LOCALES },
    lang: meta.lang,
  });
}
