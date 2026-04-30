import { FC, PropsWithChildren } from "react";

type QuoteProps = PropsWithChildren;

const Quote: FC<QuoteProps> = ({ children }) => {
  return (
    <blockquote className="rounded border-l-4 border-purple-500 bg-purple-100 px-4 py-1 dark:bg-purple-900">
      {children}
    </blockquote>
  );
};

export default Quote;
