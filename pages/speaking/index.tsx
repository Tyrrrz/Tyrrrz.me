import c from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import { FiCalendar, FiMapPin, FiMessageCircle, FiMic, FiRadio, FiTool } from 'react-icons/fi';
import Heading from '~/components/heading';
import Inline from '~/components/inline';
import Link from '~/components/link';
import Meta from '~/components/meta';
import Paragraph from '~/components/paragraph';
import Timeline from '~/components/timeline';
import TimelineItem from '~/components/timelineItem';
import { SpeakingEngagement, loadSpeakingEngagements } from '~/data/speaking';
import { groupBy } from '~/utils/array';
import { bufferIterable } from '~/utils/async';
import { deleteUndefined } from '~/utils/object';

type SpeakingPageProps = {
  engagements: SpeakingEngagement[];
};

const SpeakingPage: NextPage<SpeakingPageProps> = ({ engagements }) => {
  const engagementsByYear = groupBy(engagements, (engagement) =>
    new Date(engagement.date).getFullYear()
  ).sort((a, b) => b.key - a.key);

  return (
    <>
      <Meta title="Speaking" />

      <section>
        <Heading>Speaking</Heading>

        <Paragraph>
          These are all the speaking engagements I&apos;ve had in the past, or plan to have in the
          future. Where available, follow the links to see the video recordings. If you want me to
          speak at your event, please contact me on{' '}
          <Link href="https://bsky.app/profile/tyrrrz.me">Bluesky</Link>.
        </Paragraph>
      </section>

      <section className={c('mt-8', 'space-y-6')}>
        {engagementsByYear.map(({ key: year, items }, i) => (
          <section key={i}>
            <Heading level={2}>{year}</Heading>

            <div className={c('ml-4')}>
              <Timeline>
                {items.map((engagement, i) => (
                  <TimelineItem key={i}>
                    {/* Title */}
                    <div className={c('text-lg')}>
                      <Link
                        href={
                          engagement.recordingUrl ||
                          engagement.presentationUrl ||
                          engagement.eventUrl ||
                          '#'
                        }
                      >
                        {engagement.title}
                      </Link>
                    </div>

                    {/* Misc info */}
                    <div className={c('flex', 'flex-wrap', 'gap-x-3', 'font-light')}>
                      <Inline>
                        <FiCalendar strokeWidth={1} />
                        <div>
                          {new Date(engagement.date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </Inline>

                      <Inline>
                        {{
                          talk: <FiMic strokeWidth={1} />,
                          workshop: <FiTool strokeWidth={1} />,
                          podcast: <FiRadio strokeWidth={1} />
                        }[engagement.kind] || <FiMic strokeWidth={1} />}
                        <div className={c('capitalize')}>{engagement.kind}</div>
                      </Inline>

                      <Inline>
                        <FiMapPin strokeWidth={1} />
                        <div>
                          <Link href={engagement.eventUrl || '#'}>{engagement.event}</Link>
                        </div>
                      </Inline>

                      <Inline>
                        <FiMessageCircle strokeWidth={1} />
                        <div className={c('capitalize')}>{engagement.language}</div>
                      </Inline>
                    </div>
                  </TimelineItem>
                ))}
              </Timeline>
            </div>
          </section>
        ))}
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps<SpeakingPageProps> = async () => {
  const engagements = await bufferIterable(loadSpeakingEngagements());

  // Remove undefined values because they cannot be serialized
  deleteUndefined(engagements);

  engagements.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  return {
    props: {
      engagements
    }
  };
};

export default SpeakingPage;
