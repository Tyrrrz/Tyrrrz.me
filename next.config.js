// @ts-check

const withPlugins = require('next-compose-plugins');
const withCss = require('@zeit/next-css')

module.exports = withPlugins([
  withCss
]);