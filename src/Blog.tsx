import { graphql } from 'gatsby';
import moment from 'moment';
import React from 'react';
import { FiCalendar, FiClock, FiTag } from 'react-icons/fi';
import { humanizeTimeToRead } from './infra/utils';
import Layout from './shared/Layout';
import Link from './shared/Link';

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
      date: moment(node.frontmatter?.date!),
      tags: node.frontmatter?.tags?.map((tag) => tag!)!,
      timeToRead: node.timeToRead!
    }))
    .sort((a, b) => b.date.unix() - a.date.unix());

  const years = [...new Set(blogPosts.map((blogPost) => blogPost.date.year()))];

  const blogPostsByYear = years
    .sort((a, b) => b - a)
    .map((year) => ({
      year,
      blogPosts: blogPosts.filter((blogPost) => blogPost.date.year() === year)
    }));

  return (
    <Layout meta={{ title: 'Blog', rssUrl: '/blog/rss.xml' }}>
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
            </div>
          ))}
        </div>
      ))}
    </Layout>
  );
}
