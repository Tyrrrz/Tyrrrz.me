import moment from 'moment';
import relToAbs from 'rel-to-abs';
import RSS from 'rss';
import config from '../infra/config';
import { getBlogPosts } from '../infra/content';
import { getAbsoluteUrl } from '../infra/utils';

// This script will be ran in the export directory
// Paths are relative to project root

const blogPosts = getBlogPosts();

const feed = new RSS({
  title: 'Blog | Alexey Golub',
  site_url: config.siteUrl,
  feed_url: getAbsoluteUrl(config.siteUrl, '/blog/rss.xml'),
  language: 'en',
  ttl: 60
});

blogPosts
  .sort((a, b) => moment(b.date).unix() - moment(a.date).unix())
  .forEach((blogPost) => {
    feed.item({
      title: blogPost.title,
      description: relToAbs.convert(blogPost.html, config.siteUrl),
      url: getAbsoluteUrl(config.siteUrl, `/blog/${blogPost.id}`),
      guid: getAbsoluteUrl(config.siteUrl, `/blog/${blogPost.id}`),
      categories: blogPost.tags,
      author: 'Alexey Golub',
      date: blogPost.date
    });
  });

console.log(feed.xml());
