type RefProps = {
  to: string;
};

export const Ref = ({ to }: RefProps) => {
  return (
    <a data-or-ref href={`#${to}`}>
      {to}
    </a>
  );
};
