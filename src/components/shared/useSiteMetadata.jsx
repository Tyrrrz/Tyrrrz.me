import { graphql, useStaticQuery } from 'gatsby';

export default () => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          siteUrl
          title
          description
          email
          github
          twitter
          instagram
          patreon
          buymeacoffee
          bitcoin
          ethereum
        }
      }
    }
  `);

  return data.site.siteMetadata;
};
