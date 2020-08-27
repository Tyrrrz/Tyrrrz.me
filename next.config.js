// @ts-check

const WebpackShellPlugin = require('webpack-shell-plugin');
const WebpackCopyPlugin = require('copy-webpack-plugin');
const withPlugins = require('next-compose-plugins');
const withCss = require('@zeit/next-css')

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Only handle server-side (static) environment
    if (!isServer) return config;

    const originalEntry = config.entry;
    config.entry = async () => ({
      ...await originalEntry(),

      // Compile scripts so that they can used later in the build
      './scripts/generateRss': './src/scripts/generateRss'
    });

    // Generate RSS feed
    config.plugins.push(new WebpackShellPlugin({
      onBuildEnd: ['node ./.next/server/scripts/generateRss.js > ./public/blog/rss.xml']
    }));

    // Copy accompanying blog content
    config.plugins.push(new WebpackCopyPlugin({
      patterns: [
        {
          from: './data/blog/',
          to: './pages/blog/',
          globOptions: {
            ignore: ['**/*.md']
          }
        }
      ]
    }))

    return config;
  }
};

module.exports = withPlugins([
  withCss
], nextConfig);