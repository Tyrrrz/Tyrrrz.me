import c from 'classnames';
import { FC, PropsWithChildren } from 'react';
import { FiLink } from 'react-icons/fi';
import Link from '~/components/link';

type HeadingProps = PropsWithChildren<{
  id?: string;
  level?: 1 | 2 | 3 | 4 | 5;
}>;

const Heading: FC<HeadingProps> = ({ id, level = 1, children }) => {
  const Proxy = `h${level}` as const;

  return (
    <Proxy
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
      <div className={c('flex', 'items-baseline', 'gap-2')}>
        <div>{children}</div>

        {id && (
          <div className={c('sm:invisible', 'group-hover:visible', 'text-base')}>
            <Link href={`#${id}`}>
              <FiLink />
            </Link>
          </div>
        )}
      </div>
    </Proxy>
  );
};

export default Heading;
