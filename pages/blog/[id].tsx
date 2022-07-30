import Heading from '@/components/heading';
import Inline from '@/components/inline';
import Markdown from '@/components/markdown';
import Meta from '@/components/meta';
import Page from '@/components/page';
import { BlogPost, loadBlogPost, loadBlogPosts } from '@/data';
import { getDisqusId, getSiteUrl } from '@/utils/env';
import { getTimeToReadMs } from '@/utils/str';
import c from 'classnames';
import { DiscussionEmbed } from 'disqus-react';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { FC } from 'react';
import { FiCalendar, FiClock } from 'react-icons/fi';

type BlogPostPageProps = {
  post: BlogPost;
};

type BlogPostPageParams = {
  id: string;
};

const Discussion: FC<BlogPostPageProps> = ({ post }) => {
  const disqusId = getDisqusId();
  if (!disqusId) {
    return null;
  }

  return (
    <DiscussionEmbed
      shortname={disqusId}
      config={{
        identifier: `Blog/${post.id}`,
        url: getSiteUrl(`/blog/${post.id}`),
        title: post.title,
        language: 'en'
      }}
    />
  );
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
            <span>{Math.ceil(getTimeToReadMs(post.source) / 60000)} min read</span>
          </Inline>
        </div>
      </section>

      <section>
        <Markdown source={post.source} />
      </section>

      <section>
        <Discussion post={post} />
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
