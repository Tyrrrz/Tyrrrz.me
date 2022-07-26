import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { FiCalendar, FiClock } from 'react-icons/fi';
import Box from '../../components/box';
import Header from '../../components/header';
import Meta from '../../components/meta';
import Stack from '../../components/stack';
import { BlogPost, getBlogPost, getBlogPosts } from '../../data';
import { getTimeToReadMs } from '../../utils/str';

type BlogPostPageProps = {
  post: BlogPost;
};

type BlogPostPageParams = {
  id: string;
};

const BlogPostPage: NextPage<BlogPostPageProps> = ({ post }) => {
  return (
    <>
      <Meta title={post.title} />
      <Header>{post.title}</Header>

      <Box classes={['-mt-2']}>
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
              {Math.ceil(getTimeToReadMs(post.content) / 60000)} minutes
            </Box>
          </Stack>
        </Stack>
      </Box>
    </>
  );
};

export const getStaticPaths: GetStaticPaths<BlogPostPageParams> = async () => {
  const ids: string[] = [];
  for await (const post of getBlogPosts()) {
    ids.push(post.id);
  }

  return {
    paths: ids.map((id) => ({ params: { id } })),
    fallback: false
  };
};

export const getStaticProps: GetStaticProps<BlogPostPageProps, BlogPostPageParams> = async ({
  params
}) => {
  const { id } = params || {};
  if (!id) {
    throw new Error('Missing blog post ID');
  }

  return {
    props: {
      post: await getBlogPost(id)
    }
  };
};

export default BlogPostPage;
