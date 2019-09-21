const path = require('path');
const routes = require('./src/routes');

exports.createPages = async ({ actions, graphql }) => {
  // Generate pages for static routes
  Object.keys(routes.static).forEach(routeName =>
    actions.createPage(routes.static[routeName])
  );

  // Generate pages for blog posts
  const queryResult = await graphql(`
    query {
      allMarkdownRemark {
        nodes {
          fields {
            slug
          }
        }
      }
    }
  `);

  if (queryResult.errors) throw queryResult.errors;

  queryResult.data.allMarkdownRemark.nodes.forEach(node => {
    const slug = node.fields.slug;

    actions.createPage({
      path: routes.dynamic.blogPost.getPath(slug),
      component: routes.dynamic.blogPost.component,
      context: { slug }
    });
  });

  // Configure redirects
  Object.keys(routes.redirects).forEach(from => {
    actions.createRedirect({
      fromPath: from,
      toPath: routes.redirects[from],
      force: true,
      redirectInBrowser: true
    });
  });
};

exports.onCreateNode = ({ actions, node }) => {
  // Add slug to markdown files
  if (node.internal.type === `MarkdownRemark`) {
    actions.createNodeField({
      node,
      name: `slug`,
      value: path.basename(path.dirname(node.fileAbsolutePath))
    });
  }
};
