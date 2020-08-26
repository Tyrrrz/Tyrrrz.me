import moment from 'moment';
import React from 'react';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import Layout from '../shared/layout';
import Link from '../shared/link';

export default function HomePage() {
  const myAge = moment().diff(moment('1995-04-28'), 'years');

  return (
    <Layout>
      <figure className="w-128 h-128 mx-auto">
        <img className="radius-50pc" src="/photo.png" />
      </figure>

      <hr />

      <div className="px-5 py-2">
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

      <div className="align-center">
        <Link className="button" href="https://github.com/Tyrrrz">
          <FiGithub className="fs-3" />
        </Link>
        <Link className="button" href="https://twitter.com/Tyrrrz">
          <FiTwitter className="fs-3" />
        </Link>
        <Link className="button" href="https://linkedin.com/in/Tyrrrz">
          <FiLinkedin className="fs-3" />
        </Link>
      </div>
    </Layout>
  );
}
