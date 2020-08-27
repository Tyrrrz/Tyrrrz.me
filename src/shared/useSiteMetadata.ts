import { graphql, useStaticQuery } from 'gatsby';

interface SiteMetadata {
  siteUrl: string;
  title: string;
  description: string;
}

export default function useSiteMetadata() {
  const data = useStaticQuery(graphql`
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

  return data.site.siteMetadata as SiteMetadata;
}
