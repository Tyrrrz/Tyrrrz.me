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
      date: node.frontmatter?.date!,
      tags: node.frontmatter?.tags?.map((tag) => tag!)!,
      timeToRead: node.timeToRead!
    }))
    .sort((a, b) => moment(b.date).unix() - moment(a.date).unix());

  const years = [...new Set(blogPosts.map((blogPost) => moment(blogPost.date).year()))];

  const blogPostsByYear = years
    .sort((a, b) => b - a)
    .map((year) => ({
      year,
      blogPosts: blogPosts.filter((blogPost) => moment(blogPost.date).year() === year)
    }));

  return (
    <Layout meta={{ title: 'Blog', rssUrl: '/blog/rss.xml' }}>
      <h1 className="title">Blog</h1>

      <p>
        This blog is where I share my thoughts on programming.
        <br />
        If you want to know when I post a new article, follow me on{' '}
        <Link href="https://twitter.com/Tyrrrz">Twitter</Link> or subscribe to the{' '}
        <Link href="/blog/rss.xml">RSS feed</Link> ✨
      </p>

      {blogPostsByYear.map(({ year, blogPosts }, i) => (
        <div key={year}>
          <div className={`d-flex align-items-center mb-2 ${i > 0 && 'mt-5'}`}>
            <div className="fs-3">{year}</div> <hr className="mx-4 my-0" />
          </div>

          {blogPosts.map((blogPost) => (
            <div key={blogPost.id} className="my-4">
              <div className="fs-2">
                <Link href={`/blog/${blogPost.id}`}>{blogPost.title}</Link>
              </div>

              <div className="opacity-70 mt-1 ">
                <span className="mr-3">
                  <FiCalendar className="align-middle" />{' '}
                  <span className="align-middle">
                    {moment(blogPost.date).format('DD MMM, yyyy')}
                  </span>
                </span>

                <span className="mr-3">
                  <FiClock className="align-middle" />{' '}
                  <span className="align-middle">{humanizeTimeToRead(blogPost.timeToRead)}</span>
                </span>

                <span>
                  <FiTag className="align-middle" />{' '}
                  <span className="align-middle">{blogPost.tags.join(', ')}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </Layout>
  );
}
