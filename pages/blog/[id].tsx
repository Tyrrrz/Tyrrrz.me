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
import useTheme from '~/hooks/useTheme';
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
    <section className={c('p-4', 'border', 'border-purple-500', 'rounded', 'bg-purple-100')}>
      <div className={c('w-fit', 'mx-auto')}>
        <Image src={post.coverUrl} width={800} height={450} alt="Cover image" priority />
      </div>
    </section>
  );
};

const ArticleSection: FC<BlogPostPageProps> = ({ post }) => {
  return (
    <section>
      <article>
        <Markdown
          source={post.source}
          // Transform local-relative URLs to site-relative URLs
          transformUrl={(url: string) => {
            if (isAbsoluteUrl(url) || url.startsWith('/')) {
              return url;
            }

            return `/blog/${post.id}/${url}`;
          }}
        />
      </article>
    </section>
  );
};

const UkraineSection: FC = () => {
  return (
    <section>
      <UkraineAlert />
    </section>
  );
};

const SubscribeSection: FC = () => {
  return (
    <section className={c('p-4', 'border', 'border-purple-500', 'rounded', 'space-y-1')}>
      <div className={c('font-semibold')}>🔔 Subscribe for more</div>

      <div>
        Want to know when I post a new article? Follow me on{' '}
        <Link href="https://twitter.com/Tyrrrz">Twitter</Link> or{' '}
        <Link href="https://bsky.app/profile/tyrrrz.me">Bluesky</Link>, or subscribe to the{' '}
        <Link href="/blog/rss.xml" external>
          RSS Feed
        </Link>
      </div>
    </section>
  );
};

const CommentSection: FC<BlogPostPageProps> = ({ post }) => {
  const { userPreferredTheme } = useTheme();

  return (
    <section>
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
        theme={
          userPreferredTheme === 'dark'
            ? 'dark'
            : userPreferredTheme === 'light'
              ? 'light'
              : 'preferred_color_scheme'
        }
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

      <div className={c('space-y-4')}>
        <section>
          {/* Title */}
          <Heading>{post.title}</Heading>

          {/* Misc info */}
          <div className={c('flex', 'flex-wrap', '-mt-2', 'gap-x-3', 'font-light')}>
            <Inline>
              <FiCalendar strokeWidth={1} />
              <div>
                {new Date(post.date).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </Inline>

            <Inline>
              <FiClock strokeWidth={1} />
              <div>{Math.round(post.readingTimeMins)} min read</div>
            </Inline>
          </div>
        </section>

        {/* Detailed info */}
        <CoverSection post={post} />
        <UkraineSection />
        <ArticleSection post={post} />
        <SubscribeSection />
        <CommentSection post={post} />
      </div>
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

  // Remove undefined values because they cannot be serialized
  deleteUndefined(post);

  return {
    props: {
      post
    }
  };
};

export default BlogPostPage;
