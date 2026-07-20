export type { OpenReportConfig, PaperSize, CitationStyle } from './config';

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

export { Cover } from './components/cover';
export { Toc } from './components/toc';
export { Figure } from './components/figure';
export { Table } from './components/table';
export { Cite } from './components/cite';
export { Ref } from './components/ref';
export { References } from './components/references';
