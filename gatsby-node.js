const path = require('path');
const routes = require('./src/routes');

exports.createPages = async ({ actions, graphql }) => {
  await routes.createRoutes(actions, graphql);
};

exports.onCreateNode = ({ actions, node }) => {
  // Add slug to markdown files
  if (node.internal.type === `MarkdownRemark`) {
    actions.createNodeField({
      node,
      name: 'slug',
      value: path.basename(path.dirname(node.fileAbsolutePath))
    });
  }
};
