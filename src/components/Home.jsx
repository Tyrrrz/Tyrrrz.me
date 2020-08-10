import { mdiAt, mdiGithub, mdiInstagram, mdiTwitter } from '@mdi/js';
import { graphql } from 'gatsby';
import Img from 'gatsby-image';
import moment from 'moment';
import React from 'react';

import theme from '../theme';
import Layout from './Layout';
import Icon from './shared/Icon';
import Link from './shared/Link';
import Meta from './shared/Meta';
import Separator from './shared/Separator';
import useSiteMetadata from './shared/useSiteMetadata';

export const query = graphql`
  query {
    file(relativePath: { eq: "static/me.png" }) {
      childImageSharp {
        fixed(width: 120) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`;

const SocialLink = ({ iconPath, ...props }) => (
  <Link
    css={{
      '&:hover': { svg: { path: { fill: theme.accentColor } } },

      '&:not(:last-child)': { marginRight: '0.4em' }
    }}
    {...props}
  >
    <Icon path={iconPath} size="1.4em" />
  </Link>
);

export default ({ data }) => {
  const siteMetadata = useSiteMetadata();

  const myAge = moment().diff(moment('1995-04-28'), 'years');

  return (
    <Layout>
      <Meta />

      {/* Photo */}
      <div
        css={{
          marginTop: '1em',
          textAlign: 'center'
        }}
      >
        <Img fixed={data.file.childImageSharp.fixed} alt="my photo" css={{ borderRadius: '40%' }} />
      </div>

      <Separator />

      {/* Bio */}
      <div>
        <p>Hello! My name is Alexey, also known online as Tyrrrz. I&apos;m a {myAge} y/o software developer based in Kyiv, Ukraine.</p>
        <p>
          I&apos;m mostly experienced in C#/.NET, Azure/AWS, cloud-native applications and related technologies. At the moment I&apos;m
          working as a senior software developer for Svitla Systems, an outstaffing company.
        </p>
        <p>
          In my spare time, I&apos;m developing and maintaining a number of open-source projects. I also sometimes speak at conferences and
          blog on technical topics.
        </p>
      </div>

      <Separator />

      {/* Socials */}
      <div css={{ textAlign: 'center' }}>
        <SocialLink iconPath={mdiAt} to={`mailto:${siteMetadata.email}`} alt="Email" />
        <SocialLink iconPath={mdiGithub} to={`https://github.com/${siteMetadata.github}`} alt="GitHub" />
        <SocialLink iconPath={mdiTwitter} to={`https://twitter.com/${siteMetadata.twitter}`} alt="Twitter" />
        <SocialLink iconPath={mdiInstagram} to={`https://instagram.com/${siteMetadata.instagram}`} alt="Instagram" />
      </div>
    </Layout>
  );
};
