import { graphql } from 'gatsby';
import Img from 'gatsby-image';
import moment from 'moment';
import React from 'react';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import Layout from './shared/Layout';
import Link from './shared/Link';

export const query = graphql`
  query {
    file(relativePath: { eq: "photo.png" }) {
      childImageSharp {
        fixed(width: 128) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`;

interface HomePageProps {
  data: { file: GatsbyTypes.File };
}

export default function HomePage({ data }: HomePageProps) {
  const myAge = moment().diff(moment('1995-04-28'), 'years');

  return (
    <Layout>
      <figure className="align-center">
        <Img className="radius-50pc" fixed={data.file?.childImageSharp?.fixed!} />
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
    </Layout>
  );
}
