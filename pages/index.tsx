import Emoji from '@/components/emoji';
import Heading from '@/components/heading';
import Image from '@/components/image';
import Inline from '@/components/inline';
import Link from '@/components/link';
import Page from '@/components/page';
import Paragraph from '@/components/paragraph';
import UkraineAlert from '@/components/ukraineAlert';
import c from 'classnames';
import type { NextPage } from 'next';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';

const HomePage: NextPage = () => {
  const age = new Date(Date.now() - Date.UTC(1995, 4, 28)).getUTCFullYear() - 1970;

  const microsoftMvpUrl = 'https://mvp.microsoft.com/en-us/PublicProfile/5004136';
  const githubStarUrl = 'https://stars.github.com/profiles/Tyrrrz';

  return (
    <Page>
      <section
        className={c(
          'flex',
          'flex-col',
          'md:flex-row-reverse',
          'items-center',
          'md:items-start',
          'gap-x-6'
        )}
      >
        <div className={c('flex-none', 'w-48', 'md:w-56', 'md:mt-8')}>
          <Image src="/logo-trans.png" alt="picture" priority />
        </div>

        <div>
          <Heading>
            <Inline>
              <Emoji code="👋" />
              <span>Hello!</span>
            </Inline>
          </Heading>
          <Paragraph>
            My name is Oleksii, also known online as Tyrrrz. I&apos;m a {age} y/o software developer
            from Kyiv, Ukraine. I&apos;m also a <Link href={microsoftMvpUrl}>Microsoft MVP</Link>{' '}
            and a <Link href={githubStarUrl}>GitHub Star</Link>.
          </Paragraph>
          <Paragraph>
            Most of my endeavors are in C#, but every now and then I code in F# and TypeScript as
            well. I&apos;m primarily interested in the cloud, distributed systems, and web
            applications.
          </Paragraph>
          <Paragraph>
            My professional hobbies involve open source, conference speaking, and blogging. Outside
            of that I&apos;m also into outdoor photography, digital art, playing guitar, and
            learning foreign languages.
          </Paragraph>
        </div>
      </section>

      <div className={c('my-2')}>
        <UkraineAlert />
      </div>

      <div className={c('my-8', 'h-1', 'rounded', 'bg-purple-500')} />

      <section className={c('flex', 'justify-center', 'gap-x-3', 'text-2xl', 'font-light')}>
        <Link variant="discreet" href="https://github.com/Tyrrrz">
          <div className={c('px-2')}>
            <FiGithub strokeWidth={1} />
          </div>
        </Link>
        <Link variant="discreet" href="https://twitter.com/Tyrrrz">
          <div className={c('px-2')}>
            <FiTwitter strokeWidth={1} />
          </div>
        </Link>
        <Link variant="discreet" href="https://linkedin.com/in/Tyrrrz">
          <div className={c('px-2')}>
            <FiLinkedin strokeWidth={1} />
          </div>
        </Link>
      </section>
    </Page>
  );
};

export default HomePage;
