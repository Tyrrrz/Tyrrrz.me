import { graphql } from 'gatsby';
import Img from 'gatsby-image';
import { Disqus } from 'gatsby-plugin-disqus';
import moment from 'moment';
import 'prismjs/themes/prism-tomorrow.css';
import React from 'react';
import { FiCalendar, FiClock, FiTag } from 'react-icons/fi';
import { getAbsoluteUrl, humanizeTimeToRead } from './infra/utils';
import Layout from './shared/Layout';
import Link from './shared/Link';
import useSiteMetadata from './shared/useSiteMetadata';

export const query = graphql`
  query($slug: String!, $coverImagePath: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      frontmatter {
        title
        date
        tags
        translations {
          language
          url
        }
      }
      fields {
        slug
      }
      timeToRead
      excerpt(pruneLength: 280)
      html
    }
    cover: file(relativePath: { eq: $coverImagePath }) {
      childImageSharp {
        fluid(maxWidth: 1024) {
          ...GatsbyImageSharpFluid
        }
        original {
          src
        }
      }
    }
    coverFallback: file(relativePath: { eq: "blog-cover-fallback.png" }) {
      childImageSharp {
        original {
          src
        }
      }
    }
  }
`;

interface CommentsSectionProps {
  id: string;
  title: string;
}

function CommentsSection({ id, title }: CommentsSectionProps) {
  const siteMetadata = useSiteMetadata();

  return (
    <Disqus
      config={{
        url: getAbsoluteUrl(siteMetadata.siteUrl, '/blog/' + id),
        identifier: 'Blog/' + id,
        title
      }}
    />
  );
}

interface BlogPostPageProps {
  data: {
    markdownRemark: GatsbyTypes.MarkdownRemark;
    cover?: GatsbyTypes.File;
    coverFallback: GatsbyTypes.File;
  };
}

export default function BlogPostPage({ data }: BlogPostPageProps) {
  const blogPost = {
    id: data.markdownRemark.fields?.slug!,
    title: data.markdownRemark.frontmatter?.title!,
    date: moment(data.markdownRemark.frontmatter?.date!),
    tags: data.markdownRemark.frontmatter?.tags?.map((tag) => tag!)!,
    translations: data.markdownRemark.frontmatter?.translations?.map((translation) => ({
      language: translation?.language!,
      url: translation?.url!
    }))!,
    timeToRead: data.markdownRemark.timeToRead!,
    excerpt: data.markdownRemark.excerpt!,
    html: data.markdownRemark.html!
  };

  const coverImage = data.cover?.childImageSharp;
  const coverImageFallback = data.coverFallback.childImageSharp!;

  return (
    <Layout
      meta={{
        title: blogPost.title,
        description: blogPost.excerpt,
        keywords: blogPost.tags,
        imageUrl: coverImage?.original?.src || coverImageFallback?.original?.src,
        rssUrl: '/blog/rss.xml'
      }}
    >
      <h1>{blogPost.title}</h1>

      <div className="subtitle d-flex flex-wrap fw-thin tracking-wide">
        <div className="mr-3 d-flex align-items-center">
          <FiCalendar strokeWidth={1} />
          <div className="ml-1">{blogPost.date.format('DD MMM yyyy')}</div>
        </div>

        <div className="mr-3 d-flex align-items-center">
          <FiClock strokeWidth={1} />
          <div className="ml-1">{humanizeTimeToRead(blogPost.timeToRead)}</div>
        </div>

        <div className="d-flex align-items-center">
          <FiTag strokeWidth={1} />
          <div className="ml-1">{blogPost.tags.join(', ')}</div>
        </div>
      </div>

      {blogPost.translations && blogPost.translations.length > 0 && (
        <div className="mt-2 mb-5">
          Translated by readers into:{' '}
          {blogPost.translations.map((translation) => (
            <Link key={translation.language} href={translation.url}>
              {translation.language}
            </Link>
          ))}
        </div>
      )}

      {coverImage?.fluid && (
        <figure className="mx-auto my-5">
          <Img fluid={coverImage.fluid} alt={blogPost.title} />
        </figure>
      )}

      <article dangerouslySetInnerHTML={{ __html: blogPost.html }} />

      <hr />

      <div className="fs-2">
        Want to know when I post a new article? Follow me on{' '}
        <Link href="https://twitter.com/Tyrrrz">Twitter</Link> or subscribe to the{' '}
        <Link href="/blog/rss.xml">RSS Feed</Link> ✨
      </div>

      <hr />

      <CommentsSection id={blogPost.id} title={blogPost.title} />
    </Layout>
  );
}
