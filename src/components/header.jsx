import React from 'react';
import { Link } from 'gatsby';

import styled from '@emotion/styled';

import theme from '../theme';
import routes from '../routes';
import useSiteMetadata from './hooks/useSiteMetadata';

const Container = styled.header`
  padding-top: 0.3em;
  padding-bottom: 0.3em;
  background-color: ${theme.mainColor};
  color: ${theme.inverseTextColor};
`;

const Grid = styled.div`
  display: grid;
  max-width: 1000px;
  width: 96%;
  min-height: 70px;
  margin-left: auto;
  margin-right: auto;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto;
  grid-template-areas: 'title . menu';
  align-items: center;

  @media only screen and (max-width: 640px) {
    display: block;
    text-align: center;
  }
`;

const Title = styled.div`
  grid-area: title;
  font-size: 2.3em;

  a {
    text-decoration: none;
  }
`;

const Menu = styled.div`
  grid-area: menu;
  font-size: 1.3em;
`;

const MenuItem = styled.span`
  &:not(:last-child) {
    margin-right: 0.4em;
  }

  a {
    border-width: 0 0 2px 0;
    border-style: solid;
    border-color: transparent;
    text-decoration: none;
  }

  a:hover {
    color: ${theme.accentColor};
  }
`;

const ActiveMenuItemLinkStyle = {
  borderColor: theme.accentColor
};

export default () => {
  const siteMetadata = useSiteMetadata();

  return (
    <Container>
      <Grid>
        <Title>
          <Link to={routes.static.home.path}>{siteMetadata.title}</Link>
        </Title>

        <Menu>
          <MenuItem>
            <Link
              activeStyle={ActiveMenuItemLinkStyle}
              partiallyActive={false}
              to={routes.static.home.path}
            >
              home
            </Link>
          </MenuItem>

          <MenuItem>
            <Link
              activeStyle={ActiveMenuItemLinkStyle}
              partiallyActive={true}
              to={routes.static.projects.path}
            >
              projects
            </Link>
          </MenuItem>

          <MenuItem>
            <Link
              activeStyle={ActiveMenuItemLinkStyle}
              partiallyActive={true}
              to={routes.static.blog.path}
            >
              blog
            </Link>
          </MenuItem>

          <MenuItem>
            <Link
              activeStyle={ActiveMenuItemLinkStyle}
              partiallyActive={true}
              to={routes.static.talks.path}
            >
              talks
            </Link>
          </MenuItem>
        </Menu>
      </Grid>
    </Container>
  );
};
