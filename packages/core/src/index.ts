export type { CitationStyle, OpenReportConfig, PaperSize } from './config';

export type ReportMeta = {
  title: string;
  author?: string;
  course?: string;
  advisor?: string;
  date?: string;
  citationStyle?: import('./config').CitationStyle;
  template?: string;
  lang?: string;
  createdAt: string;
};

export { Cite } from './components/cite';
export { Cover } from './components/cover';
export { Figure } from './components/figure';
export { Ref } from './components/ref';
export { References } from './components/references';
export { Table } from './components/table';
export { Toc } from './components/toc';
