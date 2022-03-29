import { graphql, useStaticQuery } from 'gatsby';

const useSiteMetadata = () => {
  const { site } = useStaticQuery<{ site: GatsbyTypes.Site }>(graphql`
    query {
      site {
        siteMetadata {
          siteUrl
          title
          description
        }
      }
    }
  `);

  return site.siteMetadata!;
};

export default useSiteMetadata;
