import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { BlogPost, getBlogPost, getBlogPosts } from '../../data';

type BlogPostPageProps = {
  post: BlogPost;
};

type BlogPostPageParams = {
  id: string;
};

const BlogPostPage: NextPage<BlogPostPageProps> = ({ post }) => {
  return <></>;
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
