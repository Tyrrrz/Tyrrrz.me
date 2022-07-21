import { GetStaticProps, NextPage } from 'next';
import { FiDollarSign } from 'react-icons/fi';
import Box from '../components/box';
import Header from '../components/header';
import Meta from '../components/meta';
import Stack from '../components/stack';
import { Donation, getDonations } from '../data';

type DonationPageProps = {
  donations: Donation[];
};

const DonationPage: NextPage<DonationPageProps> = ({ donations }) => {
  const isLargeDonation = (donation: Donation) => {
    return donation.amount >= 0.85 * Math.max(...donations.map((d) => d.amount));
  };

  const isMediumDonation = (donation: Donation) => {
    return donation.amount >= 0.25 * Math.max(...donations.map((d) => d.amount));
  };

  return (
    <>
      <Meta title="Donate" />
      <Header>Donate</Header>

      <Box classes={['flex', 'flex-wrap', 'gap-3']}>
        {donations.map((donation, i) => (
          <Box
            key={i}
            classes={[
              'p-4',
              'grow',
              'rounded',
              'border-2',
              'border-purple-500',
              {
                'border-red-500': isLargeDonation(donation),
                'border-yellow-500': isMediumDonation(donation)
              },
              'bg-purple-100',
              'text-center'
            ]}
          >
            <Box classes={['flex', 'justify-center', 'text-xl']}>
              <Stack orientation="horizontal">
                <FiDollarSign /> <Box>{donation.amount.toFixed(2)}</Box>
              </Stack>
            </Box>
            <Box classes={['font-semibold']}>{donation.name || '< Anonymous >'}</Box>
            <Box>{donation.platform}</Box>
          </Box>
        ))}
      </Box>
    </>
  );
};

export const getStaticProps: GetStaticProps<DonationPageProps> = async () => {
  const donations: Donation[] = [];
  for await (const donation of getDonations()) {
    donations.push(donation);
  }

  donations.sort((a, b) => b.amount - a.amount);

  return {
    props: {
      donations
    }
  };
};

export default DonationPage;
