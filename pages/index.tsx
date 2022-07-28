import c from 'classnames';
import type { NextPage } from 'next';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import Emoji from '../components/emoji';
import Image from '../components/image';
import Link from '../components/link';
import Page from '../components/page';

const HomePage: NextPage = () => {
  const age = new Date(Date.now() - Date.UTC(1995, 4, 28)).getUTCFullYear() - 1970;

  return (
    <Page>
      <section className={c('flex', 'items-center', 'justify-between', 'gap-3')}>
        <div className={c('flex-none')}>
          <div className={c('text-3xl', 'sm:text-4xl')}>Oleksii Holub</div>
          <div className={c('text-xl', 'font-thin', 'tracking-wide')}>software developer</div>

          <div className={c('my-3', 'h-1', 'bg-purple-500')} />

          <div className={c('text-2xl')}>
            <div className={c('flex', 'flex-wrap', 'gap-x-5', 'font-light')}>
              <Link variant="discreet" href="https://github.com/Tyrrrz">
                <FiGithub strokeWidth={1} />
              </Link>
              <Link variant="discreet" href="https://twitter.com/Tyrrrz">
                <FiTwitter strokeWidth={1} />
              </Link>
              <Link variant="discreet" href="https://linkedin.com/in/Tyrrrz">
                <FiLinkedin strokeWidth={1} />
              </Link>
            </div>
          </div>
        </div>

        <div className={c('w-64')}>
          <Image src="/logo-trans.png" alt="picture" priority />
        </div>
      </section>

      <section className={c('mt-2')}>
        <div className={c('text-2xl', 'sm:text-3xl', 'tracking-wide')}>
          <Emoji code="👋" /> Hello!
        </div>
        <article className={c('mt-2', 'sm:text-xl', 'space-y-2')}>
          <p>
            My name is Oleksii, also known online as Tyrrrz. I&apos;m a {age} y/o software developer
            from Kyiv, Ukraine. I&apos;m also a Microsoft MVP and a GitHub Star.
          </p>
          <p>
            Most of my endeavors are in C#, but every now and then I code in F# and TypeScript as
            well. I&apos;m primarily interested in the cloud, distributed systems, and web
            applications.
          </p>
          <p>
            My professional hobbies involve open source, conference speaking, and blogging. Outside
            of that I&apos;m also into outdoor photography, digital art, playing guitar, and
            learning foreign languages.
          </p>
        </article>
      </section>
    </Page>
  );
};

export default HomePage;
