import Heading from '@/components/heading';
import Inline from '@/components/inline';
import Link from '@/components/link';
import Meta from '@/components/meta';
import Page from '@/components/page';
import Paragraph from '@/components/paragraph';
import Timeline from '@/components/timeline';
import TimelineItem from '@/components/timelineItem';
import { BlogPostRef, loadBlogPostRefs } from '@/data';
import c from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import { FiCalendar, FiClock } from 'react-icons/fi';

type BlogPageProps = {
  posts: BlogPostRef[];
};

const BlogPage: NextPage<BlogPageProps> = ({ posts }) => {
  const years = [...new Set(posts.map((post) => new Date(post.date).getFullYear()))];

  const groups = years
    .sort((a, b) => b - a)
    .map((year) => ({
      year,
      posts: posts.filter((post) => new Date(post.date).getFullYear() === year)
    }));

  return (
    <Page>
      <Meta title="Blog" />

      <section>
        <Heading>Blog</Heading>

        <Paragraph>
          I write about software design, architecture, programming languages, and other technical
          topics. Follow me on <Link href="https://twitter.com/Tyrrrz">Twitter</Link> or subscribe
          to the <Link href="/blog/rss.xml">RSS Feed</Link> to get notified when I post a new
          article.
        </Paragraph>
      </section>

      <section className={c('mt-8', 'space-y-6')}>
        {groups.map(({ year, posts }, i) => (
          <section key={i}>
            <Heading variant="h2">{year}</Heading>

            <div className={c('ml-4')}>
              <Timeline>
                {posts.map((post, i) => (
                  <TimelineItem key={i}>
                    <div className={c('text-lg')}>
                      <Link href={`/blog/${post.id}`}>{post.title}</Link>
                    </div>

                    <div className={c('flex', 'flex-wrap', 'gap-x-3', 'font-light')}>
                      <Inline>
                        <FiCalendar strokeWidth={1} />
                        <span>
                          {new Date(post.date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </Inline>

                      <Inline>
                        <FiClock strokeWidth={1} />
                        <span>{Math.ceil(post.timeToReadMs / 60000)} min read</span>
                      </Inline>
                    </div>
                  </TimelineItem>
                ))}
              </Timeline>
            </div>
          </section>
        ))}
      </section>
    </Page>
  );
};

export const getStaticProps: GetStaticProps<BlogPageProps> = async () => {
  const posts: BlogPostRef[] = [];
  for await (const post of loadBlogPostRefs()) {
    posts.push(post);
  }

  posts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  return {
    props: {
      posts
    }
  };
};

export default BlogPage;
