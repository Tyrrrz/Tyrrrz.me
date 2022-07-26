import { GetStaticProps, NextPage } from 'next';
import { FiDollarSign } from 'react-icons/fi';
import Box from '../components/box';
import Header from '../components/header';
import Link from '../components/link';
import List from '../components/list';
import ListItem from '../components/listItem';
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

      <Box classes={['space-y-2']}>
        <Box>
          If you found any of my projects useful and want to support their development, please
          consider making a donation! I accept donations through the following platforms:
        </Box>
        <List>
          <ListItem>
            <Box type="span" classes={['font-semibold']}>
              <Link href="https://github.com/sponsors/Tyrrrz">GitHub Sponsors</Link>
            </Box>
            <Box type="span"> (recurring, one-time)</Box>
          </ListItem>

          <ListItem>
            <Box type="span">
              <Link href="https://patreon.com/Tyrrrz">Patreon</Link>
            </Box>
            <Box type="span"> (recurring)</Box>
          </ListItem>

          <ListItem>
            <Box type="span">
              <Link href="https://buymeacoffee.com/Tyrrrz">BuyMeACoffee</Link>
            </Box>
            <Box type="span"> (one-time)</Box>
          </ListItem>

          <ListItem>
            <Box type="span">Ethereum: </Box>
            <Box type="span" classes={['font-mono', 'bg-neutral-100']}>
              0x8c7D4568d4F3FC4BDBaE615C971a514f8B2236B6
            </Box>
          </ListItem>

          <ListItem>
            <Box type="span">Bitcoin: </Box>
            <Box type="span" classes={['font-mono', 'bg-neutral-100']}>
              3C9UMPHcxwSBkBuXuizcGdAnLSM54Cyoej
            </Box>
          </ListItem>

          <ListItem>
            <Box type="span">Solana: </Box>
            <Box type="span" classes={['font-mono', 'bg-neutral-100']}>
              7r7oDiMUJ4CcwTUxqYvqBJHgJ7EzmyHF64SxAGZPzz6M
            </Box>
          </ListItem>
        </List>
      </Box>

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
                <FiDollarSign /> <Box>{donation.amount.toFixed(0)}</Box>
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
