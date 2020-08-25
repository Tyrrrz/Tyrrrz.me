import moment from 'moment';
import React from 'react';
import { FiCalendar, FiGlobe, FiMessageCircle } from 'react-icons/fi';
import { getTalks, Talk } from '../../infra/content';
import Layout from '../../shared/layout';
import Link from '../../shared/link';

interface TalksProps {
  talks: Talk[];
}

export function getStaticProps() {
  const talks = getTalks();

  const props = {
    talks
  } as TalksProps;

  return { props };
}

export default function Talks({ talks }: TalksProps) {
  const years = [...new Set(talks.map((talk) => moment(talk.date).year()))];

  const talksByYear = years
    .sort((a, b) => b - a)
    .map((year) => ({
      year,
      talks: talks
        .sort((a, b) => moment(b.date).unix() - moment(a.date).unix())
        .filter((talk) => moment(talk.date).year() === year)
    }));

  return (
    <Layout meta={{ title: 'Talks' }}>
      <h1 className="title">Talks</h1>

      {talksByYear.map(({ year, talks }, i) => (
        <div key={year}>
          <div className={`is-size-4 mb-2 ${i > 0 && 'mt-5'}`}>{year}</div>

          {talks.map((talk) => (
            <div key={talk.title + talk.event} className="my-3">
              <div className="is-size-5">
                <Link href={talk.recordingUrl || talk.presentationUrl || talk.eventUrl || '#'}>
                  {talk.title}
                </Link>
              </div>

              <div className="opacity-70">
                <span>
                  <FiGlobe className="align-middle" />{' '}
                  <span className="align-middle">
                    <Link href={talk.eventUrl}>{talk.event}</Link>
                  </span>
                </span>
                <span className="ml-2">
                  <FiCalendar className="align-middle" />{' '}
                  <span className="align-middle">{moment(talk.date).format('DD MMM, yyyy')}</span>
                </span>
                <span className="ml-2">
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
