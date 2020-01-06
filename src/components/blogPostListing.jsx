import React from 'react';
import { graphql } from 'gatsby';
import MdiIcon from '@mdi/react';
import { mdiCalendar, mdiClockOutline } from '@mdi/js';
import routes from '../routes';
import { humanizeTimeToRead } from '../utils';
import Link from './link';

export const query = graphql`
  fragment BlogPostListingFragment on MarkdownRemark {
    frontmatter {
      title
      date(formatString: "DD MMMM YYYY")
    }
    fields {
      slug
    }
    excerpt(format: PLAIN, pruneLength: 350)
    timeToRead
  }
`;

export default ({ node }) => {
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

  return (
    <div
      css={{
        '&:not(:last-child)': {
          marginBottom: '1.5em'
        }
      }}>
      {/* Title */}
      <div css={{ fontSize: '1.5em' }}>
        <Link to={routes.dynamic.blogPost.getPath(node.fields.slug)} css={{ textDecoration: 'none' }}>
          {node.frontmatter.title}
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
          <Icon path={mdiCalendar} /> {node.frontmatter.date}
        </span>

        <span>
          <Icon path={mdiClockOutline} />
          {` `}
          {humanizeTimeToRead(node.timeToRead)}
        </span>
      </div>

      {/* Excerpt */}
      <div css={{ marginTop: '0.3em' }}>
        {node.excerpt}
        {` `}
        <Link to={routes.dynamic.blogPost.getPath(node.fields.slug)}>continue reading</Link>
      </div>
    </div>
  );
};
