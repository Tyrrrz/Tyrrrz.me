import Heading from '@/components/heading';
import Image from '@/components/image';
import Inline from '@/components/inline';
import Markdown from '@/components/markdown';
import Meta from '@/components/meta';
import Page from '@/components/page';
import { BlogPost, loadBlogPost, loadBlogPostRefs } from '@/data';
import { getDisqusId, getSiteUrl } from '@/utils/env';
import { isAbsoluteUrl } from '@/utils/url';
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

const CoverSection: FC<BlogPostPageProps> = ({ post }) => {
  if (!post.isCoverAvailable) {
    return null;
  }

  return (
    <section className={c('my-4', 'text-center')}>
      <Image src={`/blog/${post.id}/cover.png`} alt="Cover image" priority />
    </section>
  );
};

const ArticleSection: FC<BlogPostPageProps> = ({ post }) => {
  // Transform local-relative URLs to site-relative URLs
  const transformUrl = (url: string) => {
    if (isAbsoluteUrl(url) || url.startsWith('/')) {
      return url;
    }

    return `/blog/${post.id}/${url}`;
  };

  return (
    <section>
      <article>
        <Markdown
          source={post.source}
          transformLinkHref={transformUrl}
          transformImageSrc={transformUrl}
        />
      </article>
    </section>
  );
};

const CommentSection: FC<BlogPostPageProps> = ({ post }) => {
  const disqusId = getDisqusId();
  if (!disqusId) {
    return null;
  }

  return (
    <section>
      <DiscussionEmbed
        shortname={disqusId}
        config={{
          identifier: `Blog/${post.id}`,
          url: getSiteUrl(`/blog/${post.id}`),
          title: post.title,
          language: 'en'
        }}
      />
    </section>
  );
};

const BlogPostPage: NextPage<BlogPostPageProps> = ({ post }) => {
  return (
    <Page>
      <Meta
        title={post.title}
        imageLayout={post.isCoverAvailable ? 'fill' : 'aside'}
        imageUrl={getSiteUrl(
          post.isCoverAvailable ? `/blog/${post.id}/cover.png` : '/blog-cover-fallback.png'
        )}
      />

      <section>
        <Heading>{post.title}</Heading>

        <div className={c('flex', 'flex-wrap', '-mt-2', 'gap-x-3', 'font-light')}>
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
      </section>

      <CoverSection post={post} />
      <ArticleSection post={post} />
      <CommentSection post={post} />
    </Page>
  );
};

export const getStaticPaths: GetStaticPaths<BlogPostPageParams> = async () => {
  const ids: string[] = [];
  for await (const post of loadBlogPostRefs()) {
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
