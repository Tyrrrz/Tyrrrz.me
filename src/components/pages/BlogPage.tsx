import c from 'classnames';
import { FC } from 'react';
import { FiCalendar, FiClock } from 'react-icons/fi';
import Heading from '~/components/heading';
import Inline from '~/components/inline';
import Link from '~/components/link';
import Paragraph from '~/components/paragraph';
import Timeline from '~/components/timeline';
import TimelineItem from '~/components/timelineItem';
import { BlogPostRef } from '~/data/blog';
import { groupBy } from '~/utils/array';

type BlogPageProps = {
  posts: BlogPostRef[];
};

const BlogPage: FC<BlogPageProps> = ({ posts }) => {
  const postsByYear = groupBy(posts, (post) => new Date(post.date).getFullYear()).sort(
    (a, b) => b.key - a.key
  );

  return (
    <>
      <section>
        <Heading>Blog</Heading>

        <Paragraph>
          I write about software design, architecture, programming languages, and other technical
          topics. Follow me on <Link href="https://bsky.app/profile/tyrrrz.me">Bluesky</Link> or
          subscribe to the{' '}
          <Link href="/blog.rss" external>
            RSS Feed
          </Link>{' '}
          to get notified when I post a new article.
        </Paragraph>
      </section>

      <section className={c('mt-8', 'space-y-6')}>
        {postsByYear.map(({ key: year, items }, i) => (
          <section key={i}>
            <Heading level={2}>{year}</Heading>

            <div className={c('ml-4')}>
              <Timeline>
                {items.map((post, i) => (
                  <TimelineItem key={i}>
                    {/* Title */}
                    <div className={c('text-lg')}>
                      <Link href={`/blog/${post.id}`}>{post.title}</Link>
                    </div>

                    {/* Misc info */}
                    <div className={c('flex', 'flex-wrap', 'gap-x-3', 'font-light')}>
                      <Inline>
                        <FiCalendar strokeWidth={1} />
                        <div>
                          {new Date(post.date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </Inline>

                      <Inline>
                        <FiClock strokeWidth={1} />
                        <div>{Math.round(post.readingTimeMins)} min read</div>
                      </Inline>
                    </div>
                  </TimelineItem>
                ))}
              </Timeline>
            </div>
          </section>
        ))}
      </section>
    </>
  );
};

export default BlogPage;
