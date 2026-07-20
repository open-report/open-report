type FigureProps = {
  src: string;
  caption: string;
  id?: string;
  width?: string;
};

export const Figure = ({ src, caption, id, width }: FigureProps) => {
  return (
    <figure data-or-figure id={id} style={{ breakInside: 'avoid' }}>
      <img src={src} alt={caption} style={width ? { width } : undefined} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
};
