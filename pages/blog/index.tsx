import { GetStaticProps, NextPage } from 'next';
import { BlogPost, getBlogPosts } from '../../data';

type BlogPageProps = {
  posts: BlogPost[];
};

const BlogPage: NextPage<BlogPageProps> = ({ posts }) => {
  return <></>;
};

export const getStaticProps: GetStaticProps<BlogPageProps> = async () => {
  const posts: BlogPost[] = [];
  for await (const post of getBlogPosts()) {
    posts.push(post);
  }

  return {
    props: {
      posts
    }
  };
};

export default BlogPage;
