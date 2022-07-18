import { GetStaticProps, NextPage } from 'next';
import { getSpeakingEngagements, SpeakingEngagement } from '../../data';

type SpeakingPageProps = {
  engagements: SpeakingEngagement[];
};

const SpeakingPage: NextPage<SpeakingPageProps> = ({ engagements }) => {
  return <></>;
};

export const getStaticProps: GetStaticProps<SpeakingPageProps> = async () => {
  const engagements: SpeakingEngagement[] = [];
  for await (const engagement of getSpeakingEngagements()) {
    engagements.push(engagement);
  }

  return {
    props: {
      engagements
    }
  };
};

export default SpeakingPage;
