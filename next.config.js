// @ts-check

const WebpackShellPlugin = require('webpack-shell-plugin');
const withPlugins = require('next-compose-plugins');
const withCss = require('@zeit/next-css')

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Only handle server-side (static) environment
    if (!isServer) return config;

    const originalEntry = config.entry;
    config.entry = async () => ({
      ...await originalEntry(),

      // Compile RSS generator so that it can used later in the build
      './src/scripts/generateRss': './src/scripts/generateRss.ts'
    });

    // Generate RSS feed
    config.plugins.push(new WebpackShellPlugin({
      onBuildEnd: ['node ./.next/server/src/scripts/generateRss.js']
    }));

    return config;
  }
};

module.exports = withPlugins([
  withCss
], nextConfig);