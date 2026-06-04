import Giscus from "@giscus/react";
import { FC } from "react";
import { FiCalendar, FiClock } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { blogPosts } from "virtual:blog";
import Heading from "../../components/heading";
import Image from "../../components/image";
import Inline from "../../components/inline";
import Link from "../../components/link";
import Markdown from "../../components/markdown";
import Meta from "../../components/meta";
import UkraineAlert from "../../components/ukraineAlert";
import type { BlogPost } from "../../data/blog";
import { useTheme } from "../../hooks/useTheme";
import { isAbsoluteUrl } from "../../utils/url";

type BlogPostPageProps = {
  post: BlogPost;
};

const CoverSection: FC<BlogPostPageProps> = ({ post }) => {
  if (!post.coverUrl) {
    return null;
  }

  return (
    <section className="rounded border border-purple-500 bg-purple-100 p-4">
      <div className="mx-auto w-fit">
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
            if (isAbsoluteUrl(url) || url.startsWith("/")) {
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
    <section className="space-y-1 rounded border border-purple-500 p-4">
      <div className="font-semibold">🔔 Subscribe for more</div>

      <div>
        Want to know when I post a new article? Follow me on{" "}
        <Link href="https://bsky.app/profile/tyrrrz.me">Bluesky</Link> or subscribe to the{" "}
        <Link href="/blog.rss" external>
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
          userPreferredTheme === "dark"
            ? "dark"
            : userPreferredTheme === "light"
              ? "light"
              : "preferred_color_scheme"
        }
        lang="en"
        loading="lazy"
      />
    </section>
  );
};

const BlogPostPage: FC = () => {
  const { id } = useParams<{ id: string }>();

  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return null;
  }

  return (
    <>
      <Meta
        title={post.title}
        description={post.excerpt}
        imageLayout={post.coverUrl ? "fill" : "aside"}
        imageUrl={post.coverUrl}
        rssUrl="/blog.rss"
      />

      <div className="space-y-4">
        <section>
          {/* Title */}
          <Heading>
            <span className="font-mono text-neutral-400">
              <Link href="/blog">‥</Link>/
            </span>
            <span>{post.title}</span>
          </Heading>

          {/* Misc info */}
          <div className="-mt-2 flex flex-wrap gap-x-3 font-light">
            <Inline>
              <FiCalendar strokeWidth={1} />
              <div>
                {new Date(post.date).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
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

export default BlogPostPage;
