import React from 'react';
import { graphql } from 'gatsby';
import MdiIcon from '@mdi/react';
import { mdiStar, mdiCodeTags } from '@mdi/js';
import theme from '../theme';
import Link from './link';
import Layout from './layout';
import Meta from './meta';

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

export default ({ data }) => {
  const Icon = ({ ...props }) => (
    <MdiIcon
      size={'1em'}
      css={{
        marginTop: '0.06em',
        verticalAlign: 'top'
      }}
      {...props}
    />
  );

  const Listing = ({ node }) => {
    const name = node.name;
    const url = node.url;
    const description = node.description;
    const stars = node.stars;
    const language = node.language;

    return (
      <div
        css={{
          '&:not(:last-child)': {
            marginBottom: '1.5em'
          }
        }}>
        {/* Title */}
        <div css={{ fontSize: '1.5em' }}>
          <Link to={url} css={{ textDecoration: 'none' }}>
            {name}
          </Link>
        </div>

        {/* Meta */}
        <div
          css={{
            marginTop: '0.3em',
            opacity: '0.65',
            fontSize: '0.8em',

            'span + span': {
              marginLeft: '1em'
            }
          }}>
          <span>
            <Icon path={mdiStar} color={theme.accentColor} />
            {` `}
            {stars}
          </span>

          <span>
            <Icon path={mdiCodeTags} />
            {` `}
            {language}
          </span>
        </div>

        {/* Description */}
        <div css={{ marginTop: '0.3em' }}>{description}</div>
      </div>
    );
  };

  return (
    <Layout>
      <Meta title="Projects" />

      {data.allProjectsJson.nodes.map(node => (
        <Listing node={node} />
      ))}
    </Layout>
  );
};
