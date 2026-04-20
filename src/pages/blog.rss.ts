import { Feed } from 'feed';
import type { APIRoute } from 'astro';
import { loadBlogPosts } from '~/data/blog';
import { getSiteUrl } from '~/utils/env';

export const GET: APIRoute = async () => {
  const siteUrl = getSiteUrl();
  const date = new Date();

  const feed = new Feed({
    id: siteUrl,
    title: "Oleksii Holub's Blog",
    description:
      'Oleksii Holub (@tyrrrz) is a software developer, open-source maintainer, tech blogger and conference speaker',
    link: getSiteUrl('/blog'),
    image: getSiteUrl('/logo.png'),
    copyright: `Copyright (c) 2015-${date.getFullYear()} Oleksii Holub`,
    updated: date
  });

  for await (const post of loadBlogPosts()) {
    feed.addItem({
      id: getSiteUrl(`/blog/${post.id}`),
      link: getSiteUrl(`/blog/${post.id}`),
      date: new Date(post.date),
      title: post.title,
      description: post.excerpt
    });
  }

  feed.items.sort((a, b) => b.date.getTime() - a.date.getTime());

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
