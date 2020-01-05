import React from 'react';
import { graphql } from 'gatsby';
import { OutboundLink } from 'gatsby-plugin-google-analytics';
import MdiIcon from '@mdi/react';
import { mdiStar, mdiCodeTags } from '@mdi/js';
import theme from '../theme';

export const query = graphql`
  fragment ProjectListingFragment on ProjectsJson {
    name
    url
    description
    stars
    language
  }
`;

export default ({ node }) => {
  const Icon = ({ ...props }) => (
    <MdiIcon
      size={'1em'}
      css={{
        marginTop: '0.06em',
        verticalAlign: 'top',
        width: '1em'
      }}
      {...props}
    />
  );

  return (
    <div
      css={{
        '&:not(:last-child)': {
          marginBottom: '1.5em'
        }
      }}>
      {/* Title */}
      <div css={{ fontSize: '1.5em' }}>
        <OutboundLink href={node.url} css={{ textDecoration: 'none' }}>
          {node.name}
        </OutboundLink>
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
          {node.stars}
        </span>

        <span>
          <Icon path={mdiCodeTags} />
          {` `}
          {node.language}
        </span>
      </div>

      {/* Description */}
      <div css={{ marginTop: '0.3em' }}>{node.description}</div>
    </div>
  );
};
