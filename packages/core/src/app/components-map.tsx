import type { ReactNode } from 'react';

type Meta = Record<string, string>;

/**
 * Citation rendering hooks, supplied by the two-pass render in PagedView.
 * Pass 1 collects cited ids in document order; pass 2 renders the formatted
 * output computed from those ids.
 */
export type CiteApi = {
  cite: (id: string, locator?: string) => ReactNode;
  bibliography: () => ReactNode;
};

const resolveSrc = (src: string, dir: string) =>
  src.startsWith('./') ? `${dir}/${src.slice(2)}` : src;

export const buildComponents = (
  meta: Meta,
  dir: string,
  citations: CiteApi,
) => {
  const zh = meta.lang?.startsWith('zh') ?? false;
  return {
    Cover: () => (
      <section data-or-cover>
        {meta.course ? <p className="or-cover-course">{meta.course}</p> : null}
        <h1 className="or-cover-title">{meta.title}</h1>
        {meta.author ? <p className="or-cover-author">{meta.author}</p> : null}
        <p className="or-cover-date">
          {meta.date ?? (meta.createdAt ?? '').slice(0, 10)}
        </p>
      </section>
    ),
    // Body is filled in after pagination (see postprocess.ts).
    Toc: () => (
      <nav data-or-toc>
        <p className="or-toc-title">{zh ? '目錄' : 'Contents'}</p>
      </nav>
    ),
    Figure: ({
      src,
      caption,
      id,
      width,
    }: {
      src: string;
      caption: string;
      id?: string;
      width?: string;
    }) => (
      <figure id={id}>
        <img
          src={resolveSrc(src, dir)}
          alt={caption}
          style={width ? { width } : undefined}
        />
        <figcaption>{caption}</figcaption>
      </figure>
    ),
    Table: ({
      caption,
      id,
      children,
    }: {
      caption: string;
      id?: string;
      children: ReactNode;
    }) => (
      <div className="or-table" id={id}>
        <p className="or-table-caption">{caption}</p>
        <table>{children}</table>
      </div>
    ),
    Cite: ({ id, locator }: { id: string; locator?: string }) =>
      citations.cite(id, locator),
    // Resolved to "圖 N" / "表 N" / "第 N 節" after pagination. `data-to` keeps
    // the target id; the visible text is a placeholder until then.
    Ref: ({ to }: { to: string }) => (
      <a className="or-ref" data-or-ref data-to={to} href={`#${to}`}>
        {to}
      </a>
    ),
    References: () => (
      <section data-or-references>
        <h1 className="or-refs-title">{zh ? '參考文獻' : 'References'}</h1>
        {citations.bibliography()}
      </section>
    ),
  };
};
