import c from 'classnames';
import type { NextPage } from 'next';
import { FiGithub, FiTwitter, FiYoutube } from 'react-icons/fi';
import Heading from '~/components/heading';
import Image from '~/components/image';
import Link from '~/components/link';
import Paragraph from '~/components/paragraph';
import UkraineAlert from '~/components/ukraineAlert';

const HomePage: NextPage = () => {
  const age = new Date(Date.now() - Date.UTC(1995, 4, 28)).getUTCFullYear() - 1970;

  const microsoftMvpUrl = 'https://mvp.microsoft.com/en-us/PublicProfile/5004136';
  const githubStarUrl = 'https://stars.github.com/profiles/tyrrrz';

  return (
    <>
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
        <div className={c('flex-none', 'w-48', 'md:w-56', 'md:mt-12')}>
          <Image src="/logo-trans.png" alt="picture" priority />
        </div>

        <div>
          <div className={c('text-center', 'md:text-left')}>
            <Heading>👋 Hello!</Heading>
          </div>
          <Paragraph>
            My name is Oleksii, also known online as Tyrrrz. I&apos;m a {age}-year-old software
            developer from Kyiv, Ukraine.
          </Paragraph>
          <Paragraph>
            Currently, I work as a consultant, focusing on developer tooling and infrastructure,
            with background interest in cloud technologies, distributed systems, and web
            applications. I enjoy seeking out creative solutions to complex problems and building
            things that empower others to do the same.
          </Paragraph>
          <Paragraph>
            I&apos;m also an active member of the developer community, a{' '}
            <Link href={microsoftMvpUrl}>Microsoft MVP</Link> and a{' '}
            <Link href={githubStarUrl}>GitHub Star</Link> — I spend most of my free time maintaining
            a few popular <Link href="/projects">open-source projects</Link>, speaking at various{' '}
            <Link href="/speaking">technical conferences</Link>, or sharing knowledge and experience
            on <Link href="/blog">my blog</Link>.
          </Paragraph>
        </div>
      </section>

      <section className={c('my-2')}>
        <UkraineAlert />
      </section>

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
        <Link variant="discreet" href="https://youtube.com/@Tyrrrz">
          <div className={c('px-2')}>
            <FiYoutube strokeWidth={1} />
          </div>
        </Link>
      </section>
    </>
  );
};

export default HomePage;
