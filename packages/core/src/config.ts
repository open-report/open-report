export type PaperSize = 'a4' | 'letter';

export type CitationStyle = 'apa' | 'mla' | 'chicago' | 'gb7714';

export type OpenReportConfig = {
  reportsDir?: string;
  templatesDir?: string;
  assetsDir?: string;
  port?: number;
  paper?: PaperSize;
  citationStyle?: CitationStyle;
  lang?: string;
};
