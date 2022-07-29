import c from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import { FiDollarSign } from 'react-icons/fi';
import Codeblock from '../components/codeblock';
import Heading from '../components/heading';
import Inline from '../components/inline';
import Link from '../components/link';
import List from '../components/list';
import ListItem from '../components/listItem';
import Meta from '../components/meta';
import Page from '../components/page';
import { Donation, loadDonations } from '../data';

type DonationPageProps = {
  donations: Donation[];
};

const DonationPage: NextPage<DonationPageProps> = ({ donations }) => {
  return (
    <Page>
      <Meta title="Donate" />
      <Heading>Donate</Heading>

      <section className={c('space-y-2')}>
        <div>
          If you found the work I do useful and want to support me financially, please consider
          making a donation through one of the following platforms:
        </div>
        <List>
          <ListItem>
            <span className={c('font-semibold')}>
              <Link href="https://github.com/sponsors/Tyrrrz">GitHub Sponsors</Link>
            </span>{' '}
            (recurring, one-time)
          </ListItem>

          <ListItem>
            <Link href="https://patreon.com/Tyrrrz">Patreon</Link> (recurring)
          </ListItem>

          <ListItem>
            <Link href="https://buymeacoffee.com/Tyrrrz">BuyMeACoffee</Link> (one-time)
          </ListItem>

          <ListItem>
            Ethereum: <Codeblock>0x8c7D4568d4F3FC4BDBaE615C971a514f8B2236B6</Codeblock>
          </ListItem>

          <ListItem>
            Bitcoin: <Codeblock>3C9UMPHcxwSBkBuXuizcGdAnLSM54Cyoej</Codeblock>
          </ListItem>

          <ListItem>
            Solana: <Codeblock>7r7oDiMUJ4CcwTUxqYvqBJHgJ7EzmyHF64SxAGZPzz6M</Codeblock>
          </ListItem>
        </List>
      </section>

      <Heading variant="h2">Top donors</Heading>

      <div
        className={c(
          'grid',
          'sm:grid-cols-2',
          'md:grid-cols-3',
          'lg:grid-cols-4',
          'xl:grid-cols-5',
          'gap-3'
        )}
      >
        {donations.map((donation, i) => (
          <section
            key={i}
            className={c(
              'p-4',
              'border',
              {
                'border-purple-500': i <= 8,
                'border-purple-300': i > 8 && i <= 32
              },
              'rounded'
            )}
          >
            <div className={c('text-lg')}>
              <Inline>
                <FiDollarSign strokeWidth={1} /> <span>{donation.amount.toFixed(0)}</span>
              </Inline>
            </div>

            <div className={c('font-semibold')}>{donation.name || '[ anonymous ]'}</div>
            <div className={c('font-light')}>{donation.platform}</div>
          </section>
        ))}
      </div>
    </Page>
  );
};

export const getStaticProps: GetStaticProps<DonationPageProps> = async () => {
  const donations: Donation[] = [];
  for await (const donation of loadDonations()) {
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
