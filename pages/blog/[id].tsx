import c from 'classnames';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { FiCalendar, FiClock } from 'react-icons/fi';
import Heading from '../../components/heading';
import Inline from '../../components/inline';
import Meta from '../../components/meta';
import Page from '../../components/page';
import { BlogPost, loadBlogPost, loadBlogPosts } from '../../data';
import { getTimeToReadMs } from '../../utils/str';

type BlogPostPageProps = {
  post: BlogPost;
};

type BlogPostPageParams = {
  id: string;
};

const BlogPostPage: NextPage<BlogPostPageProps> = ({ post }) => {
  return (
    <Page>
      <Meta title={post.title} />
      <Heading>{post.title}</Heading>

      <section className={c('-mt-2')}>
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
            <span>{Math.ceil(getTimeToReadMs(post.content) / 60000)} min to read</span>
          </Inline>
        </div>
      </section>
    </Page>
  );
};

export const getStaticPaths: GetStaticPaths<BlogPostPageParams> = async () => {
  const ids: string[] = [];
  for await (const post of loadBlogPosts()) {
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
      post: await loadBlogPost(id)
    }
  };
};

export default BlogPostPage;
