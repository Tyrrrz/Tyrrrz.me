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
  },
  talks: {
    path: `/talks`,
    component: path.resolve(__dirname, `components`, `talks.jsx`)
  },
  donate: {
    path: `/donate`,
    component: path.resolve(__dirname, `components`, `donate.jsx`)
  }
};

const dynamicRoutes = {
  blogPost: {
    getPath: slug => `${staticRoutes.blog.path}/${slug}`,
    component: path.resolve(__dirname, `components`, `blogPost.jsx`)
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

module.exports = {
  static: staticRoutes,
  dynamic: dynamicRoutes,
  redirects: redirects
};
