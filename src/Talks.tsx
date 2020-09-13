import { graphql } from 'gatsby';
import moment from 'moment';
import React from 'react';
import { FiCalendar, FiGlobe, FiMessageCircle } from 'react-icons/fi';
import Layout from './shared/Layout';
import Link from './shared/Link';

export const query = graphql`
  query {
    allTalksJson {
      nodes {
        title
        event
        date
        language
        eventUrl
        presentationUrl
        recordingUrl
      }
    }
  }
`;

interface TalksPageProps {
  data: { allTalksJson: GatsbyTypes.TalksJsonConnection };
}

export default function TalksPage({ data }: TalksPageProps) {
  const talks = [...data.allTalksJson.nodes]
    .map((node) => ({
      title: node.title!,
      event: node.event!,
      date: node.date!,
      language: node.language!,
      eventUrl: node.eventUrl!,
      presentationUrl: node.presentationUrl,
      recordingUrl: node.recordingUrl
    }))
    .sort((a, b) => moment(b.date).unix() - moment(a.date).unix());

  const years = [...new Set(talks.map((talk) => moment(talk.date).year()))];

  const talksByYear = years
    .sort((a, b) => b - a)
    .map((year) => ({
      year,
      talks: talks.filter((talk) => moment(talk.date).year() === year)
    }));

  return (
    <Layout meta={{ title: 'Talks' }}>
      <h1 className="title">Talks</h1>

      {talksByYear.map(({ year, talks }, i) => (
        <div key={year}>
          <div className={`d-flex align-items-center mb-2 ${i > 0 && 'mt-5'}`}>
            <div className="fs-3 tracking-wide">{year}</div> <hr className="mx-4 my-0" />
          </div>

          {talks.map((talk) => (
            <div key={talk.event + talk.date} className="my-4">
              <div className="fs-2">
                <Link href={talk.recordingUrl || talk.presentationUrl || talk.eventUrl || '#'}>
                  {talk.title}
                </Link>
              </div>

              <div className="mt-1 d-flex flex-wrap fw-light">
                <div className="mr-3 d-flex align-items-center">
                  <FiGlobe strokeWidth={1} />
                  <div className="ml-1">
                    <Link href={talk.eventUrl}>{talk.event}</Link>
                  </div>
                </div>

                <div className="mr-3 d-flex align-items-center">
                  <FiCalendar strokeWidth={1} />
                  <div className="ml-1">{moment(talk.date).format('DD MMM yyyy')}</div>
                </div>

                <div className="d-flex align-items-center">
                  <FiMessageCircle strokeWidth={1} />
                  <div className="ml-1">{talk.language}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </Layout>
  );
}
