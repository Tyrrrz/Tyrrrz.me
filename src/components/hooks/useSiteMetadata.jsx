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
            twitter
          }
        }
      }
    `
  );

  return data.site.siteMetadata;
};
