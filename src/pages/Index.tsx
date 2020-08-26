import moment from 'moment';
import React from 'react';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import Layout from '../shared/layout';
import Link from '../shared/link';

export default function HomePage() {
  const myAge = moment().diff(moment('1995-04-28'), 'years');

  return (
    <Layout>
      <figure className="image is-128x128 mx-auto">
        <img className="is-rounded" src="/photo.png" />
      </figure>

      <div className="is-divider is-half-width mx-auto" data-content="BIO" />

      <div className="content px-5 py-2">
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

      <div className="is-divider is-half-width mx-auto" data-content="SOCIAL" />

      <div className="content has-text-centered">
        <Link className="button is-white px-2" href="https://github.com/Tyrrrz">
          <FiGithub className="is-size-4" />
        </Link>
        <Link className="button is-white px-2" href="https://twitter.com/Tyrrrz">
          <FiTwitter className="is-size-4" />
        </Link>
        <Link className="button is-white px-2" href="https://linkedin.com/in/Tyrrrz">
          <FiLinkedin className="is-size-4" />
        </Link>
      </div>
    </Layout>
  );
}
