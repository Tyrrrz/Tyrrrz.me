const path = require('path');
const config = require('./src/infra/config');
const theme = require('./src/infra/theme');
const { getAbsoluteUrl } = require('./src/infra/utils');
const routes = require('./src/infra/routes');

// Expose some external variables to the client side
process.env.GATSBY_URL = process.env.URL;

exports.siteMetadata = {
  siteUrl: config.siteUrl,
  title: 'Alexey Golub',
  description: 'Alexey Golub (@tyrrrz) is a software developer, open source maintainer, tech blogger and conference speaker'
};

const resolvePlugin = (plugin, options) => ({
  resolve: plugin,
  options: options
});

exports.plugins = [
  // Source: file system
  resolvePlugin('gatsby-source-filesystem', {
    name: 'content',
    path: path.resolve(__dirname, 'data')
  }),

  // Transform: images
  resolvePlugin('gatsby-transformer-sharp'),

  // Transform: JSON
  resolvePlugin('gatsby-transformer-json'),

  // Transform: markdown
  resolvePlugin('gatsby-transformer-remark', {
    plugins: [
      // Transform image links
      resolvePlugin('gatsby-remark-images', {
        maxWidth: 1280,
        linkImagesToOriginal: false
      }),

      // Zoom for images
      resolvePlugin('gatsby-remark-images-zoom'),

      // Syntax highlighting
      resolvePlugin('gatsby-remark-prismjs', {
        classPrefix: 'language-',
        noInlineHighlight: true
      }),

      // Markdown extensions
      resolvePlugin('gatsby-remark-smartypants')
    ]
  }),

  // RSS feed
  resolvePlugin('gatsby-plugin-feed', {
    feeds: [
      {
        serialize: ({ query: { site, allMarkdownRemark } }) =>
          allMarkdownRemark.edges.map((edge) => ({
            ...edge.node.frontmatter,
            description: edge.node.excerpt,
            date: edge.node.frontmatter.date,
            url: getAbsoluteUrl(site.siteMetadata.siteUrl, routes.dynamic.blogPost.getPath(edge.node.fields.slug)),
            guid: getAbsoluteUrl(site.siteMetadata.siteUrl, routes.dynamic.blogPost.getPath(edge.node.fields.slug))
          })),
        query: `
          {
            allMarkdownRemark(
              sort: { order: DESC, fields: [frontmatter___date] },
            ) {
              edges {
                node {
                  excerpt(format: PLAIN, pruneLength: 500)
                  fields { slug }
                  frontmatter {
                    title
                    date
                  }
                }
              }
            }
          }
        `,
        output: routes.dynamic.blogPost.getPath('rss.xml'),
        title: 'Blog | Alexey Golub (RSS Feed)'
      }
    ]
  }),

  // App manifest
  resolvePlugin('gatsby-plugin-manifest', {
    name: 'Tyrrrzme',
    short_name: 'Tyrrrzme',
    theme_color: theme.mainColor,
    background_color: theme.mainColor,
    icon: 'src/static/favicon.png',
    start_url: '/',
    display: 'browser'
  }),

  // Inject canonical URLs into meta tags
  resolvePlugin('gatsby-plugin-canonical-urls', { siteUrl: config.siteUrl }),

  // Disqus integration
  resolvePlugin('gatsby-plugin-disqus', { shortname: config.disqusId }),

  // Google Analytics integration
  resolvePlugin('gatsby-plugin-google-analytics', {
    trackingId: config.googleAnalyticsId,
    anonymize: false,
    respectDNT: false,
    sampleRate: 100,
    siteSpeedSampleRate: 10,
    alwaysSendReferrer: true,
    head: true
  }),

  // Netlify platform integration
  resolvePlugin('gatsby-plugin-netlify'),

  // Misc plugins/dependencies
  resolvePlugin('gatsby-plugin-sharp'),
  resolvePlugin('gatsby-plugin-react-helmet'),
  resolvePlugin('gatsby-plugin-emotion'),
  resolvePlugin('gatsby-plugin-catch-links'),
  resolvePlugin('gatsby-plugin-sitemap'),
  resolvePlugin('gatsby-plugin-robots-txt'),
  resolvePlugin('gatsby-plugin-offline')
];
