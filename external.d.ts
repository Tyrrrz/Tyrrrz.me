declare module 'gatsby-plugin-disqus' {
  const Disqus: React.FC<{
    config: {
      url: string;
      identifier: string;
      title: string;
    };
  }>;
}

declare module 'twemoji' {
  const parse: (
    code: string,
    options?: {
      folder?: string;
      ext?: string;
    }
  ) => string;
}
