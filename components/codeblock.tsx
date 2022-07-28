import c from 'classnames';
import { FC, PropsWithChildren } from 'react';

type CodeblockProps = PropsWithChildren;

const Codeblock: FC<CodeblockProps> = ({ children }) => {
  return <span className={c('px-1', 'font-mono', 'bg-neutral-100')}>{children}</span>;
};

export default Codeblock;
