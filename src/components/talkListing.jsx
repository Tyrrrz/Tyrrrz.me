import React from 'react';
import { graphql } from 'gatsby';

import styled from '@emotion/styled';
import MdiIcon from '@mdi/react';
import { mdiCalendar, mdiTranslate } from '@mdi/js';

const Icon = styled(MdiIcon)`
  margin-top: 0.06em;
  vertical-align: top;
  width: 1em;
`;

const Container = styled.div`
  &:not(:last-child) {
    margin-bottom: 1.5em;
  }
`;

const Title = styled.div`
  font-size: 1.5em;

  a {
    text-decoration: none;
  }
`;

const MetadataContainer = styled.div`
  margin-top: 0.3em;
  opacity: 0.65;
  font-size: 0.8em;

  span + span {
    margin-left: 1em;
  }
`;

const Description = styled.div`
  margin-top: 0.3em;
`;

const Links = styled.div`
  margin-top: 0.3em;

  a + a {
    margin-left: 0.85em;
  }
`;

export const query = graphql`
  fragment TalkListingFragment on TalksJson {
    title
    description
    event
    date(formatString: "DD MMMM YYYY")
    language
    eventUrl
    presentationUrl
    recordingUrl
  }
`;

export default ({ node }) => (
  <Container>
    <Title>
      <a href={node.eventUrl}>{node.title}</a>
    </Title>

    <MetadataContainer>
      <span>
        <Icon path={mdiCalendar} /> {node.event} ({node.date})
      </span>

      <span>
        <Icon path={mdiTranslate} /> {node.language}
      </span>
    </MetadataContainer>

    <Description>{node.description}</Description>

    <Links>
      {node.presentationUrl && <a href={node.presentationUrl}>Presentation</a>}
      {node.recordingUrl && <a href={node.recordingUrl}>Recording</a>}
    </Links>
  </Container>
);
