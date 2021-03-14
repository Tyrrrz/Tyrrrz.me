/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check

// ---
const siteUrl = process.env['URL'] || 'http://localhost:8000';
const disqusId = process.env['TYRRRZME_DISQUS'];
const googleAnalyticsId = process.env['TYRRRZME_GOOGLEANALYTICS'];
// ---

/**
 * @param {string} url
 */
function resolveRelativeUrl(url) {
  return new URL(url, siteUrl).toString();
}

/**
 * @param {string} plugin
 * @param {object} [options]
 */
function resolvePlugin(plugin, options) {
  return {
    resolve: plugin,
    options: options
  };
}

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    siteUrl,
    title: 'Alexey Golub',
    description:
      'Alexey Golub (@tyrrrz) is a software developer, open source maintainer, tech blogger and conference speaker'
  },

  plugins: [
    // Source: file system (data)
    resolvePlugin('gatsby-source-filesystem', {
      name: 'data',
      path: './data/'
    }),

    // Source: file system (images)
    resolvePlugin('gatsby-source-filesystem', {
      name: 'images',
      path: './src/images/'
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
          // @ts-expect-error: I have no idea what the type is
          serialize: ({ query: { allMarkdownRemark } }) => {
            // @ts-expect-error: I have no idea what the type is
            return allMarkdownRemark.edges.map((edge) => ({
              ...edge.node.frontmatter,
              description: edge.node.excerpt,
              url: resolveRelativeUrl('/blog/' + edge.node.fields.slug),
              guid: resolveRelativeUrl('/blog/' + edge.node.fields.slug)
            }));
          },
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
          }`,
          output: '/blog/rss.xml',
          title: 'Blog | Alexey Golub (RSS Feed)'
        }
      ]
    }),

    // App manifest
    resolvePlugin('gatsby-plugin-manifest', {
      name: 'Tyrrrzme',
      short_name: 'Tyrrrzme',
      theme_color: '#343838',
      background_color: '#343838',
      icon: './src/images/favicon.png',
      start_url: '/',
      display: 'browser'
    }),

    // Inject canonical URLs into meta tags
    resolvePlugin('gatsby-plugin-canonical-urls', { siteUrl }),

    // Disqus integration
    resolvePlugin('gatsby-plugin-disqus', { shortname: disqusId }),

    // Google Analytics integration
    resolvePlugin('gatsby-plugin-gtag', {
      trackingId: googleAnalyticsId,
      head: true,
      anonymize: false
    }),

    // Netlify platform integration
    resolvePlugin('gatsby-plugin-netlify'),

    // Misc plugins/dependencies
    resolvePlugin('gatsby-plugin-image'),
    resolvePlugin('gatsby-plugin-sharp'),
    resolvePlugin('gatsby-plugin-react-helmet'),
    resolvePlugin('gatsby-plugin-catch-links'),
    resolvePlugin('gatsby-plugin-sitemap'),
    resolvePlugin('gatsby-plugin-robots-txt'),
    resolvePlugin('gatsby-plugin-offline'),
    resolvePlugin('gatsby-plugin-typegen')
  ]
};
