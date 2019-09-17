const path = require('path');

const getFullFilePath = name => path.resolve(__dirname, name);

const staticRoutes = {
  home: {
    path: `/`,
    component: getFullFilePath(`components/home.jsx`)
  },
  error404: {
    path: `404`,
    component: getFullFilePath(`components/error404.jsx`)
  },
  projects: {
    path: `/projects`,
    component: getFullFilePath(`components/projects.jsx`)
  },
  blog: {
    path: `/blog`,
    component: getFullFilePath(`components/blog.jsx`)
  }
};

exports.staticRoutes = staticRoutes;

const dynamicRoutes = {
  blogPost: {
    getPath: slug => `${staticRoutes.blog.path}/${slug}`,
    component: getFullFilePath(`components/blogPost.jsx`),
    query: `query { allMarkdownRemark { nodes { fields { slug } } } }`
  }
};

exports.dynamicRoutes = dynamicRoutes;

exports.createRoutes = async (actions, graphql) => {
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

  // Configure redirects for legacy URLs
  const legacyProjectUrls = [
    `/Projects/CliFx`,
    `/Projects/CliWrap`,
    `/Projects/DiscordChatExporter`,
    `/Projects/Failsafe`,
    `/Projects/Gress`,
    `/Projects/Hashsum`,
    `/Projects/LightBulb`,
    `/Projects/LtGt`,
    `/Projects/Onova`,
    `/Projects/OsuHelper`,
    `/Projects/WPSteamMarketExcerpt`,
    `/Projects/YoutubeDownloader`,
    `/Projects/YoutubeExplode`
  ];
  legacyProjectUrls.forEach(url => {
    actions.createRedirect({
      fromPath: url,
      toPath: staticRoutes.projects.path,
      force: true,
      redirectInBrowser: true
    });
  });
};
