import React from 'react';
import { graphql } from 'gatsby';
import Img from 'gatsby-image';
import styled from '@emotion/styled';

import Layout from './layout';
import Meta from './meta';

import moment from 'moment';

const PictureContainer = styled.div`
  margin-top: 1em;
  text-align: center;

  img {
    border-radius: 40%;
  }
`;

const Separator = styled.div`
  margin: 2em auto;
  background-color: #000000;
  opacity: 0.15;
  width: 75%;
  height: 1px;
`;

const Bio = styled.div``;

const MyAge = moment().diff(moment('1995-04-28'), 'years');

export default ({ data }) => (
  <Layout>
    <Meta />

    <PictureContainer>
      <Img fixed={data.file.childImageSharp.fixed} alt="my photo" />
    </PictureContainer>

    <Separator />

    <Bio>
      <p>
        Hello! My name is Alexey, also known online as Tyrrrz. I'm a {MyAge} y/o
        software developer based in Kyiv, Ukraine.
      </p>
      <p>
        I'm mostly experienced in C#/.NET, Azure/AWS, cloud-native applications
        and related technologies. At the moment I'm working as a senior software
        developer for Svitla Systems, an outstaffing company.
      </p>
      <p>
        In my spare time, I'm developing and maintaining a number of open-source
        projects. I also sometimes speak at conferences and blog on technical
        topics.
      </p>
    </Bio>
  </Layout>
);

export const query = graphql`
  query {
    file(relativePath: { eq: "static/me.png" }) {
      childImageSharp {
        fixed(width: 120) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`;
