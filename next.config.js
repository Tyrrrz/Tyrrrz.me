const { spawnSync } = require('child_process');
const PWA = require('next-pwa');
const runtimeCaching = require('next-pwa/cache');

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,

  // Pulling donations takes a very long time, so we need to make sure we don't time out too early
  staticPageGenerationTimeout: 60 * 60,

  env: {
    BUILD_ID: [
      spawnSync('git', ['rev-parse', '--short', 'HEAD']).stdout.toString().trim(),
      spawnSync('git', ['tag', '--points-at', 'HEAD']).stdout.toString().trim()
    ]
      .filter(Boolean)
      .join('-'),

    SITE_URL:
      process.env.SITE_URL ||
      (process.env.VERCEL_URL && 'https://' + process.env.VERCEL_URL) ||
      'http://localhost:3000'
  },

  redirects: async () => [
    // Old version of the site had a separate page for each project
    {
      source: '/projects/:slug',
      destination: '/projects',
      permanent: true
    },
    // Renamed blog posts
    {
      source: '/blog/return-type-inference',
      destination: '/blog/target-type-inference',
      permanent: true
    }
  ]
};

const plugins = [
  PWA({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching
  })
];

module.exports = () => {
  return plugins.reduce((config, plugin) => plugin(config), config);
};
