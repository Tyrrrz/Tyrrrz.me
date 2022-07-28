import c from 'classnames';
import { FC, PropsWithChildren } from 'react';

type HeadingProps = PropsWithChildren<{
  variant?: 'h1' | 'h2' | 'h3';
}>;

const Heading: FC<HeadingProps> = ({ variant = 'h1', children }) => {
  const RawHeading = variant;

  return (
    <RawHeading
      className={c(
        'my-4',
        {
          'text-2xl': variant === 'h1',
          'text-xl': variant === 'h2',
          'text-lg': variant === 'h3'
        },
        'font-semibold'
      )}
    >
      {children}
    </RawHeading>
  );
};

export default Heading;
