import { mdiCalendar, mdiClockOutline, mdiTranslate, mdiTwitter } from '@mdi/js';
import { graphql } from 'gatsby';
import { Disqus } from 'gatsby-plugin-disqus';
import React from 'react';

import config from '../config';
import routes from '../routes';
import theme from '../theme';
import { getAbsoluteUrl, humanizeTimeToRead } from '../utils';
import Layout from './Layout';
import Icon from './shared/Icon';
import Link from './shared/Link';
import Meta from './shared/Meta';
import Separator from './shared/Separator';
import useSiteMetadata from './shared/useSiteMetadata';

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
        translations {
          lang
          url
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
  const coverImageUrl = coverImage && coverImage.childImageSharp.original.src;
  const date = data.markdownRemark.frontmatter.date;
  const translations = data.markdownRemark.frontmatter.translations;
  const html = data.markdownRemark.html;
  const excerpt = data.markdownRemark.excerpt;
  const timeToRead = humanizeTimeToRead(data.markdownRemark.timeToRead);

  const siteMetadata = useSiteMetadata();

  const Footnote = ({ ...props }) => (
    <div
      css={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr'
      }}
      {...props}
    >
      <div css={{ gridColumn: 1 }}>
        <Icon path={mdiTwitter} size="3em" color="#1da1f2" />
      </div>
      <div
        css={{
          gridColumn: 2,
          alignSelf: 'center',
          marginLeft: '1.5em'
        }}
      >
        Follow me on <Link to={`https://twitter.com/${siteMetadata.twitter}`}>Twitter</Link> or subscribe to the{' '}
        <Link to={routes.dynamic.blogPost.getPath('rss.xml')}>RSS Feed</Link> to get notified when I post a new article ✨
      </div>
    </div>
  );

  const Comments = ({ ...props }) => (
    <Disqus
      config={{
        url: getAbsoluteUrl(config.siteDomain, url),
        identifier: `Blog/${slug}`,
        title: title
      }}
      {...props}
    />
  );

  return (
    <Layout>
      <Meta title={title} description={excerpt} imageUrl={coverImageUrl} />

      {/* Title */}
      <div css={{ fontSize: '2em' }}>{title}</div>

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

      {/* Translations */}
      {translations && (
        <div css={{ marginTop: '0.4em', opacity: '0.85', fontSize: '0.9em' }}>
          <Icon path={mdiTranslate} /> Translations:{' '}
          {translations.map((translation) => (
            <Link css={{ marginRight: '0.5em' }} key={translation.lang} to={translation.url}>
              {translation.lang}
            </Link>
          ))}
        </div>
      )}

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
          },

          hr: {
            opacity: '0.4',
            margin: '1em auto',
            width: '20%',
            borderTop: `1px solid ${theme.dimColor}`
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
