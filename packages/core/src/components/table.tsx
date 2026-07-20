import type { ReactNode } from 'react';

type TableProps = {
  caption: string;
  id?: string;
  children: ReactNode;
};

export const Table = ({ caption, id, children }: TableProps) => {
  return (
    <div data-or-table id={id}>
      <p data-or-table-caption>{caption}</p>
      <table>{children}</table>
    </div>
  );
};
