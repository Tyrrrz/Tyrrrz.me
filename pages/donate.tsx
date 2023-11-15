import c from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import { FiDollarSign } from 'react-icons/fi';
import Code from '~/components/code';
import Heading from '~/components/heading';
import Inline from '~/components/inline';
import Link from '~/components/link';
import List from '~/components/list';
import ListItem from '~/components/listItem';
import Meta from '~/components/meta';
import Paragraph from '~/components/paragraph';
import { Donation, loadDonations } from '~/data/donate';
import { bufferIterable } from '~/utils/async';
import { deleteUndefined } from '~/utils/object';

type DonationPageProps = {
  donations: Donation[];
};

const DonationPage: NextPage<DonationPageProps> = ({ donations }) => {
  return (
    <>
      <Meta title="Donate" />

      <section>
        <Heading>Donate</Heading>

        <Paragraph>
          If you found the work I do useful and want to support me financially, please consider
          making a donation through one of the following platforms:
        </Paragraph>

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
        </List>
      </section>

      {/* Donor list */}
      <section>
        <Heading level={2}>Top donors</Heading>

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
                  'border-purple-500': donation.amount >= 100,
                  'border-purple-300': donation.amount >= 25 && donation.amount < 100,
                  'dark:border-purple-700': donation.amount >= 25 && donation.amount < 100,
                  'border-purple-100': donation.amount < 25,
                  'dark:border-purple-900': donation.amount < 25
                },
                'rounded'
              )}
            >
              <div className={c('text-lg')}>
                <Inline>
                  <FiDollarSign strokeWidth={1} />
                  <div>{donation.amount.toFixed(0)}</div>
                </Inline>
              </div>

              <div
                className={c(
                  { 'font-semibold': !!donation.name },
                  'text-ellipsis',
                  'overflow-hidden'
                )}
                title={donation.name}
              >
                {donation.name || 'Anonymous'}
              </div>
              <div className={c('font-light')}>{donation.platform}</div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps<DonationPageProps> = async () => {
  const donations = await bufferIterable(loadDonations());

  // Remove undefined values because they cannot be serialized
  for (const donation of donations) {
    deleteUndefined(donation);
  }

  donations.sort((a, b) => b.amount - a.amount);

  return {
    props: {
      donations
    }
  };
};

export default DonationPage;
