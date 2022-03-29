import { compareDesc as compareDatesDesc, format as formatDate, formatDuration } from 'date-fns';
import { graphql } from 'gatsby';
import React from 'react';
import { FiCalendar, FiClock, FiTag } from 'react-icons/fi';
import Emoji from './components/Emoji';
import Link from './components/Link';
import Page from './components/Page';

interface BlogPageProps {
  data: {
    blogPosts: GatsbyTypes.MarkdownRemarkConnection;
  };
}

const BlogPage: React.FC<BlogPageProps> = ({ data }) => {
  const blogPosts = data.blogPosts.nodes
    .map((node) => ({
      id: node.fields?.slug!,
      title: node.frontmatter?.title!,
      date: new Date(node.frontmatter?.date!),
      tags: node.frontmatter?.tags?.map((tag) => tag!)!,
      timeToRead: node.timeToRead!
    }))
    .sort((a, b) => compareDatesDesc(a.date, b.date));

  const years = [...new Set(blogPosts.map((post) => post.date.getFullYear()))];

  const blogPostsByYear = years
    .sort((a, b) => b - a)
    .map((year) => ({
      year,
      blogPosts: blogPosts.filter((post) => post.date.getFullYear() === year)
    }));

  return (
    <Page title="Blog" rssUrl="/blog/rss.xml">
      <div className="section-header">Blog</div>

      <div className="section-prelude">
        If you want to know when I post a new article, follow me on{' '}
        <Link href="https://twitter.com/Tyrrrz">Twitter</Link> or subscribe to the{' '}
        <Link href="/blog/rss.xml">RSS feed</Link> <Emoji code="✨" />
      </div>

      {blogPostsByYear.map(({ year, blogPosts }) => (
        <div key={year} className="group">
          <div className="group-header">{year}</div>

          {blogPosts.map((post) => (
            <div key={post.id} className="entry">
              <div className="entry-name">
                <Link href={`/blog/${post.id}`}>{post.title}</Link>
              </div>

              <div className="entry-info">
                <div className="label">
                  <FiCalendar strokeWidth={1} />
                  <div>{formatDate(post.date, 'dd MMM yyyy')}</div>
                </div>

                <div className="label">
                  <FiClock strokeWidth={1} />
                  <div>{formatDuration({ minutes: post.timeToRead })} to read</div>
                </div>

                <div className="label">
                  <FiTag strokeWidth={1} />
                  <div>{post.tags.join(', ')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </Page>
  );
};

export const query = graphql`
  query {
    blogPosts: allMarkdownRemark {
      nodes {
        frontmatter {
          title
          date
          tags
        }
        fields {
          slug
        }
        timeToRead
      }
    }
  }
`;

export default BlogPage;
