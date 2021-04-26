import { differenceInYears } from 'date-fns';
import { StaticImage } from 'gatsby-plugin-image';
import React from 'react';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import Link from './shared/Link';
import Page from './shared/Page';

export default function HomePage() {
  const myAge = differenceInYears(new Date(), new Date(1995, 3, 28));

  return (
    <Page>
      <figure className="avatar">
        <StaticImage
          className="avatar-image"
          src="./images/photo.png"
          width={128}
          height={128}
          placeholder="blurred"
          alt="Alexey Golub"
        />
      </figure>

      <hr />

      <div>
        <p>
          Hello! My name is Alexey, also known online as Tyrrrz. I&apos;m a {myAge} y/o software
          developer based in Kyiv, Ukraine. I&apos;m also a{' '}
          <Link href="https://mvp.microsoft.com/en-us/PublicProfile/5004136">Microsoft MVP</Link>{' '}
          and a <Link href="https://stars.github.com/profiles/tyrrrz">GitHub Star</Link>.
        </p>
        <p>
          Most of my endeavors are in C#, but every now and then I code in F# and TypeScript as
          well. I&apos;m primarily interested in the cloud, distributed systems, and web
          applications.
        </p>
        <p>
          My professional hobbies involve open source, conference speaking, and blogging. Outside of
          that I&apos;m also into outdoor photography, digital art, playing guitar, and foreign
          languages.
        </p>
      </div>

      <hr />

      <div className="social-links">
        <Link className="social-link" href="https://github.com/Tyrrrz">
          <FiGithub />
        </Link>
        <Link className="social-link" href="https://twitter.com/Tyrrrz">
          <FiTwitter />
        </Link>
        <Link className="social-link" href="https://linkedin.com/in/Tyrrrz">
          <FiLinkedin />
        </Link>
      </div>
    </Page>
  );
}
