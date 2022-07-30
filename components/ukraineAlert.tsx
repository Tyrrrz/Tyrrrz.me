import Inline from '@/components/inline';
import Link from '@/components/link';
import c from 'classnames';
import { FC } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const UkraineAlert: FC = () => {
  return (
    <section className={c('p-4', 'border', 'border-red-500', 'rounded', 'bg-red-200', 'space-y-1')}>
      <p className={c('text-lg', 'font-semibold')}>
        <Inline>
          <FiAlertTriangle />
          <span className={c('md:mb-0.5')}>Ukraine is under attack</span>
        </Inline>
      </p>
      <p>
        My country, Ukraine, has been invaded by russian military forces in an act of aggression
        that can only be described as genocide.
      </p>
      <p>Be on the right side of history! Consider supporting Ukraine in its fight for freedom.</p>
      <p className={c('font-semibold')}>
        <Link href="/ukraine">Learn how you can help</Link>
      </p>
    </section>
  );
};

export default UkraineAlert;
