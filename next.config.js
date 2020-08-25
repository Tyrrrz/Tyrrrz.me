// @ts-check

const withPlugins = require('next-compose-plugins');
const withSass = require('@zeit/next-sass')

module.exports = withPlugins([withSass]);