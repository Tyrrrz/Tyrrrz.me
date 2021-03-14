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
      <figure className="align-center">
        <StaticImage
          className="radius-50pc"
          src="images/photo.png"
          width={128}
          height={128}
          placeholder="blurred"
          alt="Alexey Golub"
        />
      </figure>

      <hr />

      <div className="py-2">
        <p>
          Hello! My name is Alexey, also known online as Tyrrrz. I&apos;m a {myAge} y/o software
          developer based in Kyiv, Ukraine.
        </p>
        <p>
          Most of my endeavors are in C#, but every now and then I code in F# and TypeScript as
          well. I&apos;m primarily interested in the cloud, distributed systems, and web
          applications.
        </p>
        <p>
          My professional hobbies involve open source, conference speaking, and blogging. Outside of
          that I&apos;m also into outdoor photography, playing guitar, and learning foreign
          languages.
        </p>
      </div>

      <hr />

      <div className="align-center fs-4">
        <Link className="button" href="https://github.com/Tyrrrz">
          <FiGithub />
        </Link>
        <Link className="button" href="https://twitter.com/Tyrrrz">
          <FiTwitter />
        </Link>
        <Link className="button" href="https://linkedin.com/in/Tyrrrz">
          <FiLinkedin />
        </Link>
      </div>
    </Page>
  );
}
