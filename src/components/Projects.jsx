import { mdiCodeTags, mdiStar } from '@mdi/js';
import { graphql } from 'gatsby';
import React from 'react';

import routes from '../routes';
import theme from '../theme';
import Layout from './Layout';
import Icon from './shared/Icon';
import Link from './shared/Link';
import Meta from './shared/Meta';
import Separator from './shared/Separator';

export const query = graphql`
  query {
    allProjectsJson(sort: { fields: stars, order: DESC }) {
      nodes {
        name
        url
        description
        stars
        language
      }
    }
  }
`;

const ProjectListing = ({ node }) => {
  const name = node.name;
  const url = node.url;
  const description = node.description;
  const stars = node.stars;
  const language = node.language;

  return (
    <div css={{ '&:not(:last-child)': { marginBottom: '1.5rem' } }}>
      {/* Title */}
      <div css={{ fontSize: '1.5rem' }}>
        <Link to={url} css={{ textDecoration: 'none' }}>
          {name}
        </Link>
      </div>

      {/* Meta */}
      <div
        css={{
          marginTop: '0.3rem',
          opacity: '0.65',
          fontSize: '0.8rem',

          'span + span': { marginLeft: '1rem' }
        }}
      >
        <span>
          <Icon path={mdiStar} color={theme.accentColor} /> {stars}
        </span>

        <span>
          <Icon path={mdiCodeTags} /> {language}
        </span>
      </div>

      {/* Description */}
      <div css={{ marginTop: '0.3rem' }}>{description}</div>
    </div>
  );
};

export default ({ data }) => (
  <Layout>
    <Meta title="Projects" />

    {data.allProjectsJson.nodes.map((node) => (
      <ProjectListing key={node.name} node={node} />
    ))}

    <Separator />

    <div>
      Want to support development of my open source projects? <Link to={routes.static.donate.path}>Consider donating</Link> 💛
    </div>
  </Layout>
);
