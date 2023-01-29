import c from 'classnames';
import { DiscussionEmbed } from 'disqus-react';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { FC } from 'react';
import { FiCalendar, FiClock } from 'react-icons/fi';
import Callout from '~/components/callout';
import Heading from '~/components/heading';
import Image from '~/components/image';
import Inline from '~/components/inline';
import Link from '~/components/link';
import Markdown from '~/components/markdown';
import Meta from '~/components/meta';
import UkraineAlert from '~/components/ukraineAlert';
import { BlogPost, loadBlogPost, loadBlogPostRefs, publishBlogPostAssets } from '~/data/blog';
import { getDisqusId, getSiteUrl } from '~/utils/env';
import { deleteUndefined } from '~/utils/object';
import { isAbsoluteUrl } from '~/utils/url';

type BlogPostPageProps = {
  post: BlogPost;
};

type BlogPostPageParams = {
  id: string;
};

const CoverSection: FC<BlogPostPageProps> = ({ post }) => {
  if (!post.coverUrl) {
    return null;
  }

  return (
    <section className={c('my-4', 'bg-purple-100', 'rounded', 'border', 'border-purple-500')}>
      <div className={c('w-fit', 'mx-auto')}>
        <Image src={post.coverUrl} alt="Cover image" priority />
      </div>
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
    <>
      <Meta
        title={post.title}
        description={post.excerpt}
        imageLayout={post.coverUrl ? 'fill' : 'aside'}
        imageUrl={post.coverUrl}
        rssUrl="/blog/rss.xml"
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
            <span>{Math.round(post.readingTimeMins)} min read</span>
          </Inline>
        </div>
      </section>

      <CoverSection post={post} />

      <section className={c('my-4')}>
        <UkraineAlert />
      </section>

      <ArticleSection post={post} />

      <section className={c('my-4')}>
        <Callout>
          <div className={c('font-semibold')}>🔔 Subscribe for more</div>

          <div>
            Want to know when I post a new article? Follow me on{' '}
            <Link href="https://twitter.com/Tyrrrz">Twitter</Link> or subscribe to the{' '}
            <Link href="/blog/rss.xml">RSS Feed</Link>
          </div>
        </Callout>
      </section>

      <CommentSection post={post} />
    </>
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

  await publishBlogPostAssets(id);
  const post = await loadBlogPost(id);

  // Undefined values cannot be serialized
  deleteUndefined(post);

  return {
    props: {
      post
    }
  };
};

export default BlogPostPage;
