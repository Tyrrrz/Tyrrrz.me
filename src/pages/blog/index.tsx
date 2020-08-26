import moment from 'moment';
import React from 'react';
import { FiCalendar, FiClock, FiTag } from 'react-icons/fi';
import { BlogPost, getBlogPosts } from '../../infra/content';
import { humanizeTimeToRead } from '../../infra/utils';
import Layout from '../../shared/layout';
import Link from '../../shared/link';

interface BlogPageProps {
  blogPosts: BlogPost[];
}

export function getStaticProps() {
  const blogPosts = getBlogPosts();

  const props = {
    blogPosts
  } as BlogPageProps;

  return { props };
}

export default function BlogPage({ blogPosts }: BlogPageProps) {
  const years = [...new Set(blogPosts.map((blogPost) => moment(blogPost.date).year()))];

  const blogPostsByYear = years
    .sort((a, b) => b - a)
    .map((year) => ({
      year,
      blogPosts: blogPosts
        .sort((a, b) => moment(b.date).unix() - moment(a.date).unix())
        .filter((blogPosts) => moment(blogPosts.date).year() === year)
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
          <div className={`fs-3 mb-2 ${i > 0 && 'mt-5'}`}>{year}</div>

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
                  <span className="align-middle">
                    {humanizeTimeToRead(blogPost.timeToReadMins)}
                  </span>
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
