import { FC, PropsWithChildren } from 'react';

type ParagraphProps = PropsWithChildren;

const Paragraph: FC<ParagraphProps> = ({ children }) => {
  return <p className="my-4">{children}</p>;
};

export default Paragraph;
