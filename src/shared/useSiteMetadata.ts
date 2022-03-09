import { graphql, useStaticQuery } from 'gatsby';

interface SiteMetadata {
  siteUrl: string;
  title: string;
  description: string;
}

const useSiteMetadata = (): SiteMetadata => {
  const { site } = useStaticQuery(graphql`
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

  return site.siteMetadata as SiteMetadata;
};

export default useSiteMetadata;
