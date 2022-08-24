import c from 'classnames';
import { FC, PropsWithChildren } from 'react';

type CalloutProps = PropsWithChildren<{
  variant?: 'blue' | 'red';
}>;

const Callout: FC<CalloutProps> = ({ variant = 'blue', children }) => {
  return (
    <section
      className={c(
        'p-4',
        'border',
        { 'border-red-500': variant === 'red', 'border-blue-500': variant === 'blue' },
        'rounded',
        { 'bg-red-100': variant === 'red', 'bg-blue-100': variant === 'blue' },
        'space-y-1'
      )}
    >
      {children}
    </section>
  );
};

export default Callout;
