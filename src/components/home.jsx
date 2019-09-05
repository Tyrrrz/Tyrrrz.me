import React from 'react'
import { graphql } from 'gatsby'
import Img from 'gatsby-image'
import styled from '@emotion/styled'

import { Layout } from './layout'
import { Meta } from './meta'

import moment from 'moment'

const PictureContainer = styled.div`
  margin-top: 1em;
  text-align: center;

  img {
    border-radius: 40%;
  }
`

const Separator = styled.div`
  margin: 2em auto;
  background-color: #000000;
  opacity: 0.15;
  width: 75%;
  height: 1px;
`

const Bio = styled.div``

const MyAge = moment().diff(moment('1995-04-28'), 'years')

export default ({ data }) => (
  <Layout>
    <Meta />

    <PictureContainer>
      <Img fixed={data.file.childImageSharp.fixed} alt="my photo" />
    </PictureContainer>

    <Separator />

    <Bio>
      <p>
        Hey, my name is Alexey, also known online as Tyrrrz. I'm a {MyAge} y/o
        software developer based in Kyiv, Ukraine.
      </p>
      <p>
        I'm currently employed by 3Shape, where I'm working on cloud-based
        licensing and deployment solutions for our end-user products.
      </p>
      <p>
        In my spare time, I'm developing and maintaining a number of open-source
        projects. I'm also an aspiring photographer, avid traveler and a novice
        public speaker. Occasionally I may write about something interesting in
        my blog.
      </p>
    </Bio>
  </Layout>
)

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
`
