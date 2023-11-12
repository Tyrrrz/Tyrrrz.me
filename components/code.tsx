import c from 'classnames';
import { FC, PropsWithChildren } from 'react';

type CodeProps = PropsWithChildren;

const Code: FC<CodeProps> = ({ children }) => {
  return (
    <code
      className={c(
        'px-1',
        'border',
        'border-purple-500',
        'rounded',
        'bg-purple-100',
        'dark:bg-purple-900',
        'text-sm',
        'font-mono'
      )}
    >
      {children}
    </code>
  );
};

export default Code;
