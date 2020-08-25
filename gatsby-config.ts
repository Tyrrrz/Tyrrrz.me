import { GatsbyConfig, IPluginRefObject, IPluginRefOptions } from 'gatsby';
import path from 'path';
import { getAbsoluteUrl } from './src/infra/utils';

// Resolve configuration
const siteUrl = process.env['URL'] || 'http://localhost:8000';
const disqusId = process.env['GATSBY_DISQUS'];
const googleAnalyticsId = process.env['GATSBY_GOOGLEANALYTICS'];

function resolvePlugin(plugin: string, options?: IPluginRefOptions | undefined) {
  return {
    resolve: plugin,
    options: options
  } as IPluginRefObject;
}

export default {
  siteMetadata: {
    siteUrl,
    title: 'Alexey Golub',
    description:
      'Alexey Golub (@tyrrrz) is a software developer, open source maintainer, tech blogger and conference speaker'
  },

  plugins: [
    // Source: file system
    resolvePlugin('gatsby-source-filesystem', {
      name: 'content',
      path: path.resolve('./data')
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
        resolvePlugin('gatsby-remark-smartypants'),

        // Misc
        resolvePlugin('gatsby-remark-bulma')
      ]
    }),

    // RSS feed
    resolvePlugin('gatsby-plugin-feed', {
      feeds: [
        {
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
          serialize: ({ query: { allMarkdownRemark } }: any) => {
            return allMarkdownRemark.edges.map((edge: any) => ({
              ...edge.node.frontmatter,
              description: edge.node.excerpt,
              date: edge.node.frontmatter.date,
              url: getAbsoluteUrl(siteUrl, `/blog/${edge.node.fields.slug}`),
              guid: getAbsoluteUrl(siteUrl, `/blog/${edge.node.fields.slug}`)
            }));
          },
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
      icon: 'static/favicon.png',
      start_url: '/',
      display: 'browser'
    }),

    // Inject canonical URLs into meta tags
    resolvePlugin('gatsby-plugin-canonical-urls', { siteUrl }),

    // Disqus integration
    resolvePlugin('gatsby-plugin-disqus', { shortname: disqusId }),

    // Google Analytics integration
    resolvePlugin('gatsby-plugin-google-analytics', {
      trackingId: googleAnalyticsId,
      anonymize: false,
      respectDNT: false,
      sampleRate: 100,
      siteSpeedSampleRate: 10,
      alwaysSendReferrer: true,
      head: true
    }),

    // Netlify platform integration
    resolvePlugin('gatsby-plugin-netlify'),

    // Misc
    resolvePlugin('gatsby-plugin-sharp'),
    resolvePlugin('gatsby-plugin-react-helmet'),
    resolvePlugin('gatsby-plugin-emotion'),
    resolvePlugin('gatsby-plugin-catch-links'),
    resolvePlugin('gatsby-plugin-sitemap'),
    resolvePlugin('gatsby-plugin-robots-txt'),
    resolvePlugin('gatsby-plugin-offline'),
    resolvePlugin('gatsby-plugin-typescript'),
    resolvePlugin('gatsby-plugin-sass')
  ]
} as GatsbyConfig;
