import { compareDesc as compareDatesDesc, format as formatDate } from 'date-fns';
import { graphql } from 'gatsby';
import React from 'react';
import { FiCalendar, FiClock, FiTag } from 'react-icons/fi';
import { humanizeTimeToRead } from './infra/utils';
import Link from './shared/Link';
import Page from './shared/Page';

export const query = graphql`
  query {
    allMarkdownRemark {
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

interface BlogPageProps {
  data: { allMarkdownRemark: GatsbyTypes.MarkdownRemarkConnection };
}

export default function BlogPage({ data }: BlogPageProps) {
  const blogPosts = [...data.allMarkdownRemark.nodes]
    .map((node) => ({
      id: node.fields?.slug!,
      title: node.frontmatter?.title!,
      date: new Date(node.frontmatter?.date!),
      tags: node.frontmatter?.tags?.map((tag) => tag!)!,
      timeToRead: node.timeToRead!
    }))
    .sort((a, b) => compareDatesDesc(a.date, b.date));

  const years = [...new Set(blogPosts.map((blogPost) => blogPost.date.getFullYear()))];

  const blogPostsByYear = years
    .sort((a, b) => b - a)
    .map((year) => ({
      year,
      blogPosts: blogPosts.filter((blogPost) => blogPost.date.getFullYear() === year)
    }));

  return (
    <Page title="Blog" rssUrl="/blog/rss.xml">
      <h1 className="title">Blog</h1>

      <div className="fs-2 mb-5">
        If you want to know when I post a new article, follow me on{' '}
        <Link href="https://twitter.com/Tyrrrz">Twitter</Link> or subscribe to the{' '}
        <Link href="/blog/rss.xml">RSS feed</Link> ✨
      </div>

      {blogPostsByYear.map(({ year, blogPosts }, i) => (
        <div key={year}>
          <div className={`d-flex align-items-center mb-2 ${i > 0 && 'mt-5'}`}>
            <div className="fs-3 fw-semi-bold tracking-wide">{year}</div>
            <hr className="mx-4 my-0" />
          </div>

          {blogPosts.map((blogPost) => (
            <div key={blogPost.id} className="my-4">
              <div className="fs-2">
                <Link href={`/blog/${blogPost.id}`}>{blogPost.title}</Link>
              </div>

              <div className="mt-1 d-flex flex-wrap fw-light tracking-wide">
                <div className="mr-3 d-flex align-items-center">
                  <FiCalendar strokeWidth={1} />
                  <div className="ml-1">{formatDate(blogPost.date, 'dd MMM yyyy')}</div>
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
            </div>
          ))}
        </div>
      ))}
    </Page>
  );
}
