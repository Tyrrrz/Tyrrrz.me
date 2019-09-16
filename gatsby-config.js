const settings = require('./src/settings');
const theme = require('./src/theme');

module.exports = {
  siteMetadata: {
    siteUrl: settings.siteDomain,
    title: `Alexey Golub`,
    description: ``
  },

  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/src`
      }
    },
    {
      resolve: 'gatsby-source-github',
      options: {
        headers: {
          Authorization: `Bearer ${settings.githubToken}`
        },
        queries: [
          `{
            user(login: "Tyrrrz") {
              repositories(orderBy: {field: STARGAZERS, direction: DESC}, privacy: PUBLIC, isLocked: false, isFork: false, first: 100) {
                nodes {
                  url
                  name
                  description
                  usesCustomOpenGraphImage
                  openGraphImageUrl
                  primaryLanguage {
                    name
                    color
                  }
                  stargazers {
                    totalCount
                  }
                  isArchived
                  isPrivate
                  isDisabled
                  isLocked
                  isMirror
                }
              }
            }
          }
          `
        ]
      }
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1280,
              linkImagesToOriginal: false
            }
          },
          `gatsby-remark-images-medium-zoom`,
          `gatsby-remark-highlight.js`,
          `gatsby-remark-smartypants`
        ]
      }
    },
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Tyrrrzme`,
        short_name: `Tyrrrzme`,
        theme_color: theme.mainColor,
        background_color: theme.mainColor,
        icon: `src/static/favicon.png`,
        start_url: `/`,
        display: `standalone`
      }
    },
    `gatsby-plugin-sharp`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-emotion`,
    `gatsby-plugin-catch-links`,
    {
      resolve: `gatsby-plugin-disqus`,
      options: {
        shortname: settings.disqusId
      }
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: settings.googleAnalyticsId,
        anonymize: false,
        respectDNT: false,
        sampleRate: 100,
        siteSpeedSampleRate: 10
      }
    },
    `gatsby-plugin-sitemap`,
    'gatsby-plugin-robots-txt',
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-canonical-urls`,
      options: {
        siteUrl: settings.siteDomain
      }
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map(edge => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  date: edge.node.frontmatter.date,
                  url: `${site.siteMetadata.siteUrl}/blog/${edge.node.fields.slug}`,
                  guid: edge.node.fields.slug,
                  custom_elements: [{ 'content:encoded': edge.node.html }]
                });
              });
            },
            query: `
              {
                allMarkdownRemark(
                  sort: { order: DESC, fields: [frontmatter___date] },
                ) {
                  edges {
                    node {
                      excerpt
                      html
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
            output: '/rss.xml',
            title: 'Alexey Golub RSS feed'
          }
        ]
      }
    }
  ]
};
