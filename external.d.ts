declare module 'gatsby-plugin-disqus' {
  interface DisqusProps {
    config: {
      url: string;
      identifier: string;
      title: string;
    };
  }

  const Disqus: (props: DisqusProps) => JSX.Element;
}
