import c from 'classnames';
import { FC } from 'react';
import Link from '~/components/link';

const UkraineAlert: FC = () => {
  return (
    <section
      className={c(
        'p-4',
        'border',
        'border-l-blue-500',
        'border-t-blue-500',
        'border-r-yellow-400',
        'border-b-yellow-400',
        'rounded',
        'space-y-1'
      )}
    >
      <div className={c('font-semibold')}>❤️ Thank You for Supporting Ukraine!</div>

      <div>
        As Russia wages a genocidal war against my country, I&apos;m grateful to everyone who
        continues to stand with Ukraine in our fight for freedom.
      </div>

      <div className={c('font-semibold')}>
        <Link href="/ukraine">See how you can help</Link>
      </div>
    </section>
  );
};

export default UkraineAlert;
