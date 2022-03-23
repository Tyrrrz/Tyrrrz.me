import { format as formatDate, formatDuration } from 'date-fns';
import { graphql } from 'gatsby';
import { Disqus } from 'gatsby-plugin-disqus';
import { GatsbyImage, getSrc } from 'gatsby-plugin-image';
import 'prismjs/themes/prism-tomorrow.css';
import React from 'react';
import { FiCalendar, FiClock, FiTag } from 'react-icons/fi';
import Emoji from './components/Emoji';
import Link from './components/Link';
import Page from './components/Page';
import useSiteMetadata from './components/useSiteMetadata';
import { getAbsoluteUrl } from './utils/url';

export const query = graphql`
  query ($slug: String!, $coverImagePath: String!) {
    post: markdownRemark(fields: { slug: { eq: $slug } }) {
      frontmatter {
        title
        date
        tags
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

const CommentsSection: React.FC<CommentsSectionProps> = ({ id, title }) => {
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
};

interface BlogPostPageProps {
  data: {
    post: GatsbyTypes.MarkdownRemark;
    cover?: GatsbyTypes.File;
    coverFallback: GatsbyTypes.File;
  };
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ data }) => {
  const blogPost = {
    id: data.post.fields?.slug!,
    title: data.post.frontmatter?.title!,
    date: new Date(data.post.frontmatter?.date!),
    tags: data.post.frontmatter?.tags?.map((tag) => tag!)!,
    timeToRead: data.post.timeToRead!,
    excerpt: data.post.excerpt!,
    html: data.post.html!
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
      previewLayout="imagePriority"
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

      <div
        style={{
          padding: '1em',
          border: '2px solid orange',
          backgroundColor: '#ffebbf',
          fontSize: '1.25em'
        }}
      >
        <strong>
          <Emoji code="🇺🇦" /> Ukraine is under attack! <Emoji code="⚠" />
        </strong>
        <br />
        <Link href="/">Click here</Link> to learn what it means and find ways to help.
      </div>

      <article dangerouslySetInnerHTML={{ __html: blogPost.html }} />

      <hr />

      <div className="section-postlude">
        Want to know when I post a new article? Follow me on{' '}
        <Link href="https://twitter.com/Tyrrrz">Twitter</Link> or subscribe to the{' '}
        <Link href="/blog/rss.xml">RSS Feed</Link> <Emoji code="✨" />
      </div>

      <hr />

      <CommentsSection id={blogPost.id} title={blogPost.title} />
    </Page>
  );
};

export default BlogPostPage;
