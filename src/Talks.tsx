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
            <div className="fs-3">{year}</div> <hr className="mx-4 my-0" />
          </div>

          {talks.map((talk) => (
            <div key={talk.event + talk.date} className="my-4">
              <div className="fs-2">
                <Link href={talk.recordingUrl || talk.presentationUrl || talk.eventUrl || '#'}>
                  {talk.title}
                </Link>
              </div>

              <div className="opacity-70 mt-1 ">
                <span className="mr-3">
                  <FiGlobe className="align-middle" />{' '}
                  <span className="align-middle">
                    <Link href={talk.eventUrl}>{talk.event}</Link>
                  </span>
                </span>

                <span className="mr-3">
                  <FiCalendar className="align-middle" />{' '}
                  <span className="align-middle">{moment(talk.date).format('DD MMM, yyyy')}</span>
                </span>

                <span>
                  <FiMessageCircle className="align-middle" />{' '}
                  <span className="align-middle">{talk.language}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </Layout>
  );
}
