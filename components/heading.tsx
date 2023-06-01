import c from 'classnames';
import { FC, PropsWithChildren } from 'react';
import { FiLink } from 'react-icons/fi';
import Inline from '~/components/inline';
import Link from '~/components/link';

type HeadingProps = PropsWithChildren<{
  id?: string;
  level?: 1 | 2 | 3 | 4 | 5;
}>;

const Heading: FC<HeadingProps> = ({ id, level = 1, children }) => {
  const RawHeading = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <RawHeading
      id={id}
      className={c(
        'group',
        'my-4',
        {
          'text-3xl': level === 1,
          'text-2xl': level === 2,
          'text-xl': level === 3,
          'text-lg': level === 4
        },
        'font-semibold'
      )}
    >
      <Inline>
        <div>{children}</div>

        {id && (
          <div className={c('sm:invisible', 'group-hover:visible', 'ml-1', 'mt-1', 'text-base')}>
            <Link href={`#${id}`}>
              <FiLink />
            </Link>
          </div>
        )}
      </Inline>
    </RawHeading>
  );
};

export default Heading;
