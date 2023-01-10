import c from 'classnames';
import { FC } from 'react';
import Callout from '~/components/callout';
import Inline from '~/components/inline';
import Link from '~/components/link';

const UkraineAlert: FC = () => {
  return (
    <Callout variant="info">
      <div className={c('font-semibold')}>
        <Inline>
          <span>❤️ Thank You for Supporting Ukraine!</span>
        </Inline>
      </div>

      <div>
        As Russia wages a genocidal war against my country, I&apos;m grateful to everyone who
        continues to stand with Ukraine in our fight for freedom.
      </div>

      <div className={c('font-semibold')}>
        <Link href="/ukraine">See how you can help</Link>
      </div>
    </Callout>
  );
};

export default UkraineAlert;
