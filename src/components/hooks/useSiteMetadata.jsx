import { useStaticQuery, graphql } from 'gatsby';

export default () => {
  const data = useStaticQuery(
    graphql`
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
          }
        }
      }
    `
  );

  return data.site.siteMetadata;
};
