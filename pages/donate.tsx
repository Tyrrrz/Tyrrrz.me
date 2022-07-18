import { GetStaticProps, NextPage } from 'next';
import { Donation, getDonations } from '../data';

type DonationPageProps = {
  donations: Donation[];
};

const DonationPage: NextPage<DonationPageProps> = ({ donations }) => {
  return <></>;
};

export const getStaticProps: GetStaticProps<DonationPageProps> = async () => {
  const donations: Donation[] = [];
  for await (const donation of getDonations()) {
    donations.push(donation);
  }

  return {
    props: {
      donations
    }
  };
};

export default DonationPage;
