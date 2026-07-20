// Minimal ambient types for `citeproc` (ships as CommonJS with no types).
// Only the surface open-report uses is declared.
declare module 'citeproc' {
  export interface CiteprocSys {
    retrieveLocale(lang: string): string | undefined;
    retrieveItem(id: string): unknown;
  }

  export type CitationItem = {
    id: string;
    locator?: string;
    label?: string;
  };

  export type BibliographyMeta = {
    bibstart: string;
    bibend: string;
    entry_ids: string[][];
  };

  export class Engine {
    constructor(
      sys: CiteprocSys,
      style: string,
      lang?: string,
      forceLang?: boolean,
    );
    updateItems(ids: string[]): void;
    makeCitationCluster(items: CitationItem[]): string;
    makeBibliography(): [BibliographyMeta, string[]] | false;
  }

  const CSL: { Engine: typeof Engine };
  export default CSL;
}
