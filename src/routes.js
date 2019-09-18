const path = require('path');

const staticRoutes = {
  home: {
    path: `/`,
    component: path.resolve(__dirname, `components`, `home.jsx`)
  },
  error404: {
    path: `404`,
    component: path.resolve(__dirname, `components`, `error404.jsx`)
  },
  projects: {
    path: `/projects`,
    component: path.resolve(__dirname, `components`, `projects.jsx`)
  },
  blog: {
    path: `/blog`,
    component: path.resolve(__dirname, `components`, `blog.jsx`)
  }
};

const dynamicRoutes = {
  blogPost: {
    getPath: slug => `${staticRoutes.blog.path}/${slug}`,
    component: path.resolve(__dirname, `components`, `blogPost.jsx`),
    query: `query { allMarkdownRemark { nodes { fields { slug } } } }`
  }
};

const redirects = {
  // Redirect legacy project URLs to their GitHub pages
  '/Projects/CliFx': `https://github.com/Tyrrrz/CliFx`,
  '/Projects/CliWrap': `https://github.com/Tyrrrz/CliWrap`,
  '/Projects/DiscordChatExporter': `https://github.com/Tyrrrz/DiscordChatExporter`,
  '/Projects/Failsafe': `https://github.com/Tyrrrz/Failsafe`,
  '/Projects/Gress': `https://github.com/Tyrrrz/Gress`,
  '/Projects/Hashsum': `https://github.com/Tyrrrz/Hashsum`,
  '/Projects/LightBulb': `https://github.com/Tyrrrz/LightBulb`,
  '/Projects/LtGt': `https://github.com/Tyrrrz/LtGt`,
  '/Projects/Onova': `https://github.com/Tyrrrz/Onova`,
  '/Projects/OsuHelper': `https://github.com/Tyrrrz/OsuHelper`,
  '/Projects/WPSteamMarketExcerpt': `https://github.com/Tyrrrz/WPSteamMarketExcerpt`,
  '/Projects/YoutubeDownloader': `https://github.com/Tyrrrz/YoutubeDownloader`,
  '/Projects/YoutubeExplode': `https://github.com/Tyrrrz/YoutubeExplode`
};

const createRoutes = async (actions, graphql) => {
  // Generate pages for static routes
  Object.keys(staticRoutes).forEach(routeName =>
    actions.createPage(staticRoutes[routeName])
  );

  // Generate pages for dynamic routes
  await Object.keys(dynamicRoutes).forEach(async routeName => {
    const route = dynamicRoutes[routeName];
    const queryResult = await graphql(route.query);

    if (queryResult.errors) throw queryResult.errors;

    queryResult.data.allMarkdownRemark.nodes.forEach(node => {
      const slug = node.fields.slug;

      actions.createPage({
        path: route.getPath(slug),
        component: route.component,
        context: { slug }
      });
    });
  });

  // Configure redirects
  Object.keys(redirects).forEach(from => {
    actions.createRedirect({
      fromPath: from,
      toPath: redirects[from],
      force: true,
      redirectInBrowser: true
    });
  });
};

module.exports = {
  static: staticRoutes,
  dynamic: dynamicRoutes,
  createRoutes: createRoutes
};
