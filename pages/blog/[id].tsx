import Giscus from '@giscus/react';
import c from 'classnames';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { FC } from 'react';
import { FiCalendar, FiClock } from 'react-icons/fi';
import Heading from '~/components/heading';
import Image from '~/components/image';
import Inline from '~/components/inline';
import Link from '~/components/link';
import Markdown from '~/components/markdown';
import Meta from '~/components/meta';
import UkraineAlert from '~/components/ukraineAlert';
import { BlogPost, loadBlogPost, loadBlogPostRefs, publishBlogPostAssets } from '~/data/blog';
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
    <section
      className={c('mt-4', 'p-4', 'bg-purple-100', 'rounded', 'border', 'border-purple-500')}
    >
      <div className={c('w-fit', 'mx-auto')}>
        <Image src={post.coverUrl} width={800} height={450} alt="Cover image" priority />
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
    <section className={c('mt-4')}>
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

const SubscribeSection: FC = () => {
  return (
    <section className={c('mt-4', 'p-4', 'border', 'rounded', 'space-y-1')}>
      <div className={c('font-semibold')}>🔔 Subscribe for more</div>

      <div>
        Want to know when I post a new article? Follow me on{' '}
        <Link href="https://twitter.com/Tyrrrz">Twitter</Link> or subscribe to the{' '}
        <Link href="/blog/rss.xml">RSS Feed</Link>
      </div>
    </section>
  );
};

const CommentSection: FC<BlogPostPageProps> = ({ post }) => {
  return (
    <section className={c('mt-4')}>
      <Giscus
        repo="Tyrrrz/Tyrrrz.me"
        repoId="MDEwOlJlcG9zaXRvcnkyMDY0MDIxMDc="
        category="Blog"
        categoryId="DIC_kwDODE1yO84CT-_a"
        mapping="specific"
        strict="1"
        term={post.title}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="light"
        lang="en"
        loading="lazy"
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

      <section className={c('mt-4')}>
        <UkraineAlert />
      </section>

      <ArticleSection post={post} />
      <SubscribeSection />
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
