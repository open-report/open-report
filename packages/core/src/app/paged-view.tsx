import type { MdxContent } from 'virtual:open-report/reports';
import { Previewer } from 'pagedjs';
import { useEffect, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildComponents } from './components-map';
import printCss from './print.css?raw';

type PagedViewProps = {
  Content: MdxContent;
  meta: Record<string, string>;
  dir: string;
};

export const PagedView = ({ Content, meta, dir }: PagedViewProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.innerHTML = '';
    const html = renderToStaticMarkup(
      <div className="or-content" lang={meta.lang ?? 'en'}>
        <Content components={buildComponents(meta, dir)} />
      </div>,
    );
    const blob = new Blob([printCss], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    new Previewer().preview(html, [url], node).finally(() => {
      URL.revokeObjectURL(url);
    });
    return () => {
      node.innerHTML = '';
    };
  }, [Content, meta, dir]);
  return <div className="or-paper-scroll" ref={ref} />;
};
