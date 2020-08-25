import { GatsbyNode } from 'gatsby';
import path from 'path';

export default {
  onCreateNode: ({ actions, node }) => {
    // Add slug to markdown files
    if (node.internal.type === 'MarkdownRemark') {
      const filePath = node.fileAbsolutePath as string;

      actions.createNodeField({
        node,
        name: 'slug',
        value: path.basename(path.dirname(filePath))
      });
    }
  },

  createPages: async ({ actions, graphql }) => {
    // Generate pages for blog posts
    const queryResult = (await graphql(`
      query {
        allMarkdownRemark {
          nodes {
            fields {
              slug
            }
          }
        }
      }
    `)) as any;

    queryResult.data.allMarkdownRemark.nodes.forEach((node: any) => {
      const slug = node.fields.slug;

      actions.createPage({
        path: `/blog/${slug}`,
        component: path.resolve('./src/templates/BlogPost.tsx'),
        context: { slug }
      });
    });
  }
} as GatsbyNode;
