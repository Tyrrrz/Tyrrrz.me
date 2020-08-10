import { mdiCalendar, mdiClockOutline } from '@mdi/js';
import { graphql } from 'gatsby';
import React from 'react';

import routes from '../routes';
import { humanizeTimeToRead } from '../utils';
import Layout from './Layout';
import Icon from './shared/Icon';
import Link from './shared/Link';
import Meta from './shared/Meta';
import Separator from './shared/Separator';
import useSiteMetadata from './shared/useSiteMetadata';

export const query = graphql`
  query {
    allMarkdownRemark(sort: { fields: frontmatter___date, order: DESC }) {
      nodes {
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
    }
  }
`;

const BlogListing = ({ node }) => {
  const slug = node.fields.slug;
  const url = routes.dynamic.blogPost.getPath(slug);
  const title = node.frontmatter.title;
  const date = node.frontmatter.date;
  const excerpt = node.excerpt;
  const timeToRead = humanizeTimeToRead(node.timeToRead);

  return (
    <div css={{ '&:not(:last-child)': { marginBottom: '1.5em' } }}>
      {/* Title */}
      <div css={{ fontSize: '1.5em' }}>
        <Link to={url} css={{ textDecoration: 'none' }}>
          {title}
        </Link>
      </div>

      {/* Meta */}
      <div
        css={{
          marginTop: '0.3em',
          opacity: '0.65',
          fontSize: '0.8em',

          'span + span': { marginLeft: '1em' }
        }}
      >
        <span>
          <Icon path={mdiCalendar} /> {date}
        </span>

        <span>
          <Icon path={mdiClockOutline} /> {timeToRead}
        </span>
      </div>

      {/* Excerpt */}
      <div css={{ marginTop: '0.3em' }}>
        {excerpt} <Link to={url}>continue reading</Link>
      </div>
    </div>
  );
};

export default ({ data }) => {
  const siteMetadata = useSiteMetadata();

  return (
    <Layout>
      <Meta title="Blog" />

      {data.allMarkdownRemark.nodes.map((node) => (
        <BlogListing key={node.slug} node={node} />
      ))}

      <Separator />

      <div>
        Want to know when I post a new article? Follow me on <Link to={`https://twitter.com/${siteMetadata.twitter}`}>Twitter</Link> or
        subscribe to the <Link to={routes.dynamic.blogPost.getPath('rss.xml')}>RSS Feed</Link> ✨
      </div>
    </Layout>
  );
};
