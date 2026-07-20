/// <reference types="vite/client" />

declare module 'virtual:open-report/reports' {
  import type { ReactElement } from 'react';

  export type MdxContent = (props: {
    components?: Record<string, unknown>;
  }) => ReactElement;

  export type ReportEntry = {
    id: string;
    dir: string;
    meta: Record<string, string>;
    /** Raw BibTeX contents of the report's references.bib ('' if absent). */
    bib: string;
    load: () => Promise<{ default: MdxContent }>;
  };

  export const reports: ReportEntry[];
}

declare module 'pagedjs' {
  export class Previewer {
    preview(
      content?: string | Node,
      stylesheets?: string[],
      renderTo?: Element | null,
    ): Promise<unknown>;
  }
}
