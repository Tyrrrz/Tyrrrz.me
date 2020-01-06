import React from 'react';
import { graphql } from 'gatsby';
import MdiIcon from '@mdi/react';
import { mdiCalendar, mdiClockOutline, mdiTwitterCircle } from '@mdi/js';
import { Disqus } from 'gatsby-plugin-disqus';
import settings from '../settings';
import routes from '../routes';
import theme from '../theme';
import useSiteMetadata from './hooks/useSiteMetadata';
import Link from './link';
import Layout from './layout';
import Meta from './meta';
import Separator from './separator';
import { humanizeTimeToRead } from '../utils';

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      frontmatter {
        title
        date(formatString: "DD MMMM YYYY")
        cover {
          childImageSharp {
            original {
              src
            }
          }
        }
      }
      fields {
        slug
      }
      html
      excerpt(format: PLAIN, pruneLength: 248)
      timeToRead
    }
  }
`;

export default ({ data }) => {
  const slug = data.markdownRemark.fields.slug;
  const url = routes.dynamic.blogPost.getPath(slug);
  const title = data.markdownRemark.frontmatter.title;
  const coverImage = data.markdownRemark.frontmatter.cover;
  const coverImageUrl = coverImage && new URL(coverImage.childImageSharp.original.src, settings.siteDomain);
  const date = data.markdownRemark.frontmatter.date;
  const html = data.markdownRemark.html;
  const excerpt = data.markdownRemark.excerpt;
  const timeToRead = humanizeTimeToRead(data.markdownRemark.timeToRead);

  const siteMetadata = useSiteMetadata();

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

  const Footnote = ({ ...props }) => (
    <div
      css={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr'
      }}
      {...props}>
      <div css={{ gridColumn: 1 }}>
        <Icon path={mdiTwitterCircle} size={'3em'} color="#1da1f2" />
      </div>
      <div
        css={{
          gridColumn: 2,
          alignSelf: 'center',
          marginLeft: '1.5em'
        }}>
        <Link to={`https://twitter.com/${siteMetadata.twitter}`}>Follow me on Twitter</Link> to get notified when I post a new article ✨
      </div>
    </div>
  );

  const Comments = ({ ...props }) => (
    <Disqus
      config={{
        url: new URL(url, settings.siteDomain),
        identifier: `Blog/${slug}`,
        title: title
      }}
      {...props}
    />
  );

  return (
    <Layout>
      <Meta title={title} description={excerpt} image={coverImageUrl} />

      {/* Title */}
      <div css={{ fontSize: '2em' }}>{title}</div>

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
          <Icon path={mdiCalendar} />
          {` `}
          {date}
        </span>

        <span>
          <Icon path={mdiClockOutline} />
          {` `}
          {timeToRead}
        </span>
      </div>

      {/* Content */}
      <div
        css={{
          code: {
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace",
            fontSize: '0.8em'
          },

          '*:not(pre) > code': {
            padding: '0.2em',
            borderRadius: '2px',
            backgroundColor: '#f0f0f0'
          },

          pre: {
            fontWeight: '300',
            lineHeight: '1'
          },

          'blockquote p': {
            borderLeft: `solid 2px ${theme.accentColor}`,
            borderRadius: '2px',
            paddingLeft: '0.5em'
          }
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <Separator />

      <Footnote />

      <Separator />

      <Comments />
    </Layout>
  );
};
