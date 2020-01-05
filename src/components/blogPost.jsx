import React from 'react';
import { graphql } from 'gatsby';
import { OutboundLink } from 'gatsby-plugin-google-analytics';
import MdiIcon from '@mdi/react';
import { mdiCalendar, mdiClockOutline, mdiTwitterCircle } from '@mdi/js';
import { Disqus } from 'gatsby-plugin-disqus';
import settings from '../settings';
import routes from '../routes';
import theme from '../theme';
import useSiteMetadata from './hooks/useSiteMetadata';
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
  const siteMetadata = useSiteMetadata();

  const coverImageUrl =
    data.markdownRemark.frontmatter.cover &&
    new URL(data.markdownRemark.frontmatter.cover.childImageSharp.original.src, settings.siteDomain);

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
        <OutboundLink href={`https://twitter.com/${siteMetadata.twitter}`}>Follow me on Twitter</OutboundLink> to get notified when I post a
        new article ✨
      </div>
    </div>
  );

  const Comments = ({ ...props }) => (
    <Disqus
      config={{
        url: new URL(routes.dynamic.blogPost.getPath(data.markdownRemark.fields.slug), settings.siteDomain),
        identifier: `Blog/${data.markdownRemark.fields.slug}`,
        title: data.markdownRemark.frontmatter.title
      }}
      {...props}
    />
  );

  return (
    <Layout>
      <Meta title={data.markdownRemark.frontmatter.title} description={data.markdownRemark.excerpt} image={coverImageUrl} />

      {/* Title */}
      <div css={{ fontSize: '2em' }}>{data.markdownRemark.frontmatter.title}</div>

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
          {data.markdownRemark.frontmatter.date}
        </span>

        <span>
          <Icon path={mdiClockOutline} />
          {` `}
          {humanizeTimeToRead(data.markdownRemark.timeToRead)}
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
        dangerouslySetInnerHTML={{ __html: data.markdownRemark.html }}
      />

      <Separator />

      <Footnote />

      <Separator />

      <Comments />
    </Layout>
  );
};
