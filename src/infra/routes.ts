import path from 'path';

const staticRoutes = {
  home: {
    path: '/',
    componentPath: path.resolve(__dirname, 'components', 'Home.tsx')
  },
  error404: {
    path: '404',
    componentPath: path.resolve(__dirname, 'components', 'Error404.tsx')
  },
  projects: {
    path: '/projects',
    componentPath: path.resolve(__dirname, 'components', 'Projects.tsx')
  },
  blog: {
    path: '/blog',
    componentPath: path.resolve(__dirname, 'components', 'Blog.tsx')
  },
  talks: {
    path: '/talks',
    componentPath: path.resolve(__dirname, 'components', 'Talks.tsx')
  },
  donate: {
    path: '/donate',
    componentPath: path.resolve(__dirname, 'components', 'Donate.tsx')
  }
};

const dynamicRoutes = {
  blogPost: {
    getPath: (slug: string) => `${staticRoutes.blog.path}/${slug}`,
    componentPath: path.resolve(__dirname, 'components', 'BlogPost.tsx')
  }
};

export default {
  static: staticRoutes,
  dynamic: dynamicRoutes
};
