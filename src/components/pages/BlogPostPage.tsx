import c from 'classnames';
import { FC } from 'react';
import { FiCalendar, FiClock } from 'react-icons/fi';
import Heading from '~/components/heading';
import Image from '~/components/image';
import Inline from '~/components/inline';
import Link from '~/components/link';
import Markdown from '~/components/markdown';
import UkraineAlert from '~/components/ukraineAlert';
import { BlogPost } from '~/data/blog';

type BlogPostPageProps = {
  post: BlogPost;
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
            if (/^[a-z][a-z\d+\-.]*:/iu.test(url) || url.startsWith('/')) {
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
        <Link href="https://bsky.app/profile/tyrrrz.me">Bluesky</Link> or subscribe to the{' '}
        <Link href="/blog.rss" external>
          RSS Feed
        </Link>
      </div>
    </section>
  );
};

const BlogPostPage: FC<BlogPostPageProps> = ({ post }) => {
  return (
    <div className={c('space-y-4')}>
      <section>
        {/* Title */}
        <Heading>
          <span className={c('font-mono', 'text-neutral-400')}>
            <Link href="/blog">‥</Link>/
          </span>
          <span>{post.title}</span>
        </Heading>

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
    </div>
  );
};

export default BlogPostPage;
