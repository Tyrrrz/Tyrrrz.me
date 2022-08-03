import c from 'classnames';
import { FC, PropsWithChildren } from 'react';

type HeadingProps = PropsWithChildren<{
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
}>;

const Heading: FC<HeadingProps> = ({ variant = 'h1', children }) => {
  const RawHeading = variant;

  return (
    <RawHeading
      className={c(
        'my-4',
        {
          'text-3xl': variant === 'h1',
          'text-2xl': variant === 'h2',
          'text-xl': variant === 'h3',
          'text-lg': variant === 'h4'
        },
        'font-semibold'
      )}
    >
      {children}
    </RawHeading>
  );
};

export default Heading;
