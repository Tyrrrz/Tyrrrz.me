import { GetStaticProps, NextPage } from 'next';
import { BlogPostRef, loadBlogPostRefs } from '~/data/blog';
import { bufferIterable } from '~/utils/async';
import { getSiteUrl } from '~/utils/env';
import { deleteUndefined } from '~/utils/object';

// Declare the RSS root element for JSX (not a standard HTML element)
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      rss: { version: string; dangerouslySetInnerHTML: { __html: string } };
    }
  }
}

type RssFeedProps = {
  siteUrl: string;
  copyrightYear: number;
  posts: BlogPostRef[];
};

const escapeXml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const RssFeed: NextPage<RssFeedProps> = ({ siteUrl, copyrightYear, posts }) => {
  const channelXml =
    `<title>Oleksii Holub's Blog</title>` +
    `<link>${siteUrl}/blog</link>` +
    `<description>Oleksii Holub (@tyrrrz) is a software developer, open-source maintainer, tech blogger and conference speaker</description>` +
    `<copyright>Copyright (c) 2015-${copyrightYear} Oleksii Holub</copyright>` +
    posts
      .map(
        (post) =>
          `<item>` +
          `<title>${escapeXml(post.title)}</title>` +
          `<link>${siteUrl}/blog/${post.id}</link>` +
          `<description>${escapeXml(post.excerpt)}</description>` +
          `<pubDate>${new Date(post.date).toUTCString()}</pubDate>` +
          `</item>`
      )
      .join('');

  return (
    <rss
      version="2.0"
      dangerouslySetInnerHTML={{ __html: `<channel>${channelXml}</channel>` }}
    />
  );
};

export const getStaticProps: GetStaticProps<RssFeedProps> = async () => {
  const posts = await bufferIterable(loadBlogPostRefs());

  // Remove undefined values because they cannot be serialized
  deleteUndefined(posts);

  posts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  return {
    props: {
      siteUrl: getSiteUrl(),
      copyrightYear: new Date().getFullYear(),
      posts
    }
  };
};

export default RssFeed;
