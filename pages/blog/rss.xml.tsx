import { GetServerSideProps, NextPage } from 'next';
import { loadBlogPostRefs } from '~/data/blog';
import { bufferIterable } from '~/utils/async';
import { getSiteUrl } from '~/utils/env';

const escapeXml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// This component is never rendered — getServerSideProps sends the response directly
const RssFeed: NextPage = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const siteUrl = getSiteUrl();
  const copyrightYear = new Date().getFullYear();

  const posts = await bufferIterable(loadBlogPostRefs());
  posts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  const items = posts
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

  const xml =
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<rss version="2.0">` +
    `<channel>` +
    `<title>Oleksii Holub's Blog</title>` +
    `<link>${siteUrl}/blog</link>` +
    `<description>Oleksii Holub (@tyrrrz) is a software developer, open-source maintainer, tech blogger and conference speaker</description>` +
    `<copyright>Copyright (c) 2015-${copyrightYear} Oleksii Holub</copyright>` +
    items +
    `</channel>` +
    `</rss>`;

  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.end(xml);

  return { props: {} };
};

export default RssFeed;
