import c from 'classnames';
import { FC, PropsWithChildren } from 'react';

type PreProps = PropsWithChildren;

const Pre: FC<PreProps> = ({ children }) => {
  return (
    <pre
      className={c(
        'p-4',
        'border',
        'border-purple-500',
        'rounded',
        'bg-purple-100',
        'overflow-auto',
        '[&>code]:p-0',
        '[&>code]:border-none'
      )}
    >
      {children}
    </pre>
  );
};

export default Pre;
