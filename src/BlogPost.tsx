import { format as formatDate, formatDuration } from 'date-fns';
import { graphql } from 'gatsby';
import { Disqus } from 'gatsby-plugin-disqus';
import { GatsbyImage, getSrc } from 'gatsby-plugin-image';
import 'prismjs/themes/prism-tomorrow.css';
import React from 'react';
import { FiCalendar, FiClock, FiTag } from 'react-icons/fi';
import { getAbsoluteUrl } from './infra/utils';
import Link from './shared/Link';
import Page from './shared/Page';
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
        gatsbyImageData(layout: CONSTRAINED, width: 1024, quality: 100, placeholder: BLURRED)
      }
    }
    coverFallback: file(relativePath: { eq: "blog-cover-fallback.png" }) {
      childImageSharp {
        gatsbyImageData(layout: CONSTRAINED, width: 1024, quality: 100, placeholder: BLURRED)
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
    date: new Date(data.markdownRemark.frontmatter?.date!),
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
    <Page
      title={blogPost.title}
      description={blogPost.excerpt}
      keywords={blogPost.tags}
      imageUrl={getSrc(coverImage?.gatsbyImageData || coverImageFallback.gatsbyImageData)}
      rssUrl="/blog/rss.xml"
    >
      <div className="section-header">{blogPost.title}</div>

      <div className="section-info">
        <div className="label">
          <FiCalendar strokeWidth={1} />
          <div>{formatDate(blogPost.date, 'dd MMM yyyy')}</div>
        </div>

        <div className="label">
          <FiClock strokeWidth={1} />
          <div>{formatDuration({ minutes: blogPost.timeToRead })} to read</div>
        </div>

        <div className="label">
          <FiTag strokeWidth={1} />
          <div>{blogPost.tags.join(', ')}</div>
        </div>
      </div>

      {coverImage?.gatsbyImageData && (
        <figure className="section-cover">
          <GatsbyImage image={coverImage.gatsbyImageData} alt={blogPost.title} />
        </figure>
      )}

      {blogPost.translations && blogPost.translations.length > 0 && (
        <div className="section-misc">
          Translated by readers into:{' '}
          {blogPost.translations.map((translation) => (
            <Link key={translation.language} href={translation.url}>
              {translation.language}
            </Link>
          ))}
        </div>
      )}

      <article dangerouslySetInnerHTML={{ __html: blogPost.html }} />

      <hr />

      <div className="section-postlude">
        Want to know when I post a new article? Follow me on{' '}
        <Link href="https://twitter.com/Tyrrrz">Twitter</Link> or subscribe to the{' '}
        <Link href="/blog/rss.xml">RSS Feed</Link> ✨
      </div>

      <hr />

      <CommentsSection id={blogPost.id} title={blogPost.title} />
    </Page>
  );
}
