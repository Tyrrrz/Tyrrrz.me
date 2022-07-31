import Inline from '@/components/inline';
import Link from '@/components/link';
import Paragraph from '@/components/paragraph';
import c from 'classnames';
import { FC } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const UkraineAlert: FC = () => {
  return (
    <section className={c('p-4', 'border', 'border-red-500', 'rounded', 'bg-red-200')}>
      <div className={c('text-lg', 'font-semibold')}>
        <Inline>
          <FiAlertTriangle className={c('md:mt-0.5')} />
          <span>Ukraine is under attack</span>
        </Inline>
      </div>
      <Paragraph>
        My country, Ukraine, has been invaded by Russian military forces in an act of aggression
        that can only be described as genocide. Be on the right side of history! Consider supporting
        Ukraine in its fight for freedom.
      </Paragraph>
      <div className={c('font-semibold')}>
        <Link href="/ukraine">Learn how you can help</Link>
      </div>
    </section>
  );
};

export default UkraineAlert;
