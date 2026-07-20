type CiteProps = {
  id: string;
  locator?: string;
};

export const Cite = ({ id, locator }: CiteProps) => {
  return <span data-or-cite={id} data-or-locator={locator} />;
};
