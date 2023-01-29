import c from 'classnames';
import { FC, PropsWithChildren } from 'react';

type CalloutProps = PropsWithChildren<{
  variant?: 'neutral' | 'info' | 'danger';
}>;

const Callout: FC<CalloutProps> = ({ variant = 'neutral', children }) => {
  return (
    <section
      className={c(
        'p-4',
        'border',
        {
          'border-blue-500': variant === 'info',
          'border-red-500': variant === 'danger'
        },
        'rounded',
        {
          'bg-blue-100': variant === 'info',
          'bg-red-100': variant === 'danger'
        },
        'space-y-1'
      )}
    >
      {children}
    </section>
  );
};

export default Callout;
