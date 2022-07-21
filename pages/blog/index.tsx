import { GetStaticProps, NextPage } from 'next';
import { FiCalendar, FiClock } from 'react-icons/fi';
import Box from '../../components/box';
import Header from '../../components/header';
import Link from '../../components/link';
import Meta from '../../components/meta';
import Stack from '../../components/stack';
import Timeline from '../../components/timeline';
import TimelineItem from '../../components/timelineItem';
import { BlogPost, getBlogPosts } from '../../data';
import { getTimeToReadMs } from '../../utils/str';

type BlogPageProps = {
  posts: BlogPost[];
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
    <>
      <Meta title="Blog" />
      <Header>Blog</Header>

      <Box classes={['text-lg']}>
        I write about software design, architecture, programming languages, and other technical
        topics. Follow me on <Link href="https://twitter.com/tyrrrz">Twitter</Link> or subscribe to
        the <Link href="/blog/rss.xml">RSS Feed</Link> to get notified when I post a new article.
      </Box>

      <Box classes={['mt-6', 'space-y-6']}>
        {groups.map(({ year, posts }, i) => (
          <Box key={i}>
            <Box classes={['my-2', 'text-xl', 'font-semibold']}>{year}</Box>

            <Box classes={['ml-4']}>
              <Timeline>
                {posts.map((post, i) => (
                  <TimelineItem key={i}>
                    <Box classes={['text-lg']}>
                      <Link href={`/blog/${post.id}`}>{post.title}</Link>
                    </Box>

                    <Stack orientation="horizontal" wrap gap="large">
                      <Stack orientation="horizontal">
                        <FiCalendar strokeWidth={1} />
                        <Box classes={['font-light']}>
                          {new Date(post.date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </Box>
                      </Stack>

                      <Stack orientation="horizontal">
                        <FiClock strokeWidth={1} />
                        <Box classes={['font-light']}>
                          {Math.ceil(getTimeToReadMs(post.content) / 60000)} minutes to read
                        </Box>
                      </Stack>
                    </Stack>
                  </TimelineItem>
                ))}
              </Timeline>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
};

export const getStaticProps: GetStaticProps<BlogPageProps> = async () => {
  const posts: BlogPost[] = [];
  for await (const post of getBlogPosts()) {
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
