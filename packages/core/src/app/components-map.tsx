import type { ReactNode } from 'react';

type Meta = Record<string, string>;

const resolveSrc = (src: string, dir: string) =>
  src.startsWith('./') ? `${dir}/${src.slice(2)}` : src;

export const buildComponents = (meta: Meta, dir: string) => ({
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
  Toc: () => (
    <nav data-or-toc>
      <p className="or-toc-title">
        {meta.lang?.startsWith('zh') ? '目錄' : 'Contents'}
      </p>
      <p className="or-placeholder">
        Table of contents will be generated here.
      </p>
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
  Cite: ({ id }: { id: string }) => <span className="or-cite">[{id}]</span>,
  Ref: ({ to }: { to: string }) => (
    <a className="or-ref" href={`#${to}`}>
      {to}
    </a>
  ),
  References: () => (
    <section data-or-references>
      <h1 className="or-refs-title">
        {meta.lang?.startsWith('zh') ? '參考文獻' : 'References'}
      </h1>
      <p className="or-placeholder">
        Formatted bibliography will be generated here.
      </p>
    </section>
  ),
});
