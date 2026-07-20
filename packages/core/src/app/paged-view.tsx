import type { MdxContent } from 'virtual:open-report/reports';
import { Previewer } from 'pagedjs';
import { useEffect, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { computeCitations } from './citations';
import { buildComponents, type CiteApi } from './components-map';
import { postProcess } from './postprocess';
import printCss from './print.css?raw';

type PagedViewProps = {
  Content: MdxContent;
  meta: Record<string, string>;
  dir: string;
  bib: string;
};

export const PagedView = ({ Content, meta, dir, bib }: PagedViewProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.innerHTML = '';

    // Pass 1: render once to collect cited ids in document order. That order
    // fixes numbering for numeric styles (GB/T 7714).
    const cited: string[] = [];
    const collector: CiteApi = {
      cite: (id) => {
        cited.push(id);
        return null;
      },
      bibliography: () => null,
    };
    renderToStaticMarkup(
      <Content components={buildComponents(meta, dir, collector)} />,
    );

    const { inline, missing, bibliographyHtml } = computeCitations(
      meta,
      bib,
      cited,
    );
    const missingSet = new Set(missing);

    // Pass 2: render the real output with formatted citations.
    const formatted: CiteApi = {
      cite: (id) => {
        if (!missingSet.has(id) && inline[id]) {
          return (
            <span
              className="or-cite"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: citeproc output is trusted, locally generated
              dangerouslySetInnerHTML={{ __html: inline[id] }}
            />
          );
        }
        console.warn(
          `[open-report] citation id "${id}" not found in references.bib`,
        );
        return <span className="or-cite or-cite-missing">[{id}?]</span>;
      },
      bibliography: () =>
        bibliographyHtml ? (
          <div
            className="or-bib"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: citeproc output is trusted, locally generated
            dangerouslySetInnerHTML={{ __html: bibliographyHtml }}
          />
        ) : (
          <p className="or-placeholder">No works cited.</p>
        ),
    };

    const html = renderToStaticMarkup(
      <div className="or-content" lang={meta.lang ?? 'en'}>
        <Content components={buildComponents(meta, dir, formatted)} />
      </div>,
    );
    // Paged.js needs a DocumentFragment here, not a string or a wrapper element:
    // - a raw string throws in flow() (it calls querySelectorAll on the content
    //   before parsing, as soon as any stylesheet sets break-*);
    // - a wrapper <div> makes the content root's parent an un-reffed element,
    //   which crashes rebuildTree with a null parent.
    // A template's fragment has querySelectorAll and is not an element parent.
    const template = document.createElement('template');
    template.innerHTML = html;
    const source = template.content;

    const blob = new Blob([printCss], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    let cancelled = false;
    new Previewer()
      .preview(source, [url], node)
      .then(() => {
        if (!cancelled) postProcess(node, meta);
      })
      .finally(() => {
        URL.revokeObjectURL(url);
      });
    return () => {
      cancelled = true;
      node.innerHTML = '';
    };
  }, [Content, meta, dir, bib]);
  return <div className="or-paper-scroll" ref={ref} />;
};
