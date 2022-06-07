import { graphql } from 'gatsby';
import React from 'react';
import { FiDollarSign, FiExternalLink } from 'react-icons/fi';
import Emoji from './components/Emoji';
import Link from './components/Link';
import Page from './components/Page';
import './Donate.css';

interface DonatePageProps {
  data: {
    donations: GatsbyTypes.DonationsJsonConnection;
  };
}

const DonatePage: React.FC<DonatePageProps> = ({ data }) => {
  const donations = data.donations.nodes
    .map((node) => ({
      name: node.name,
      amount: node.amount!,
      platform: node.platform!
    }))
    .sort((a, b) => b.amount - a.amount);

  const totalDonatedAmount = donations.reduce((acc, cur) => acc + cur.amount, 0);

  return (
    <Page title="Donate">
      <div className="section-header">Donate</div>

      <div className="section-prelude">
        If you found any of my projects useful and want to support their development, please
        consider making a donation <Emoji code="🙂" />
      </div>

      <ul>
        <li>
          <Link href="https://patreon.com/Tyrrrz">Patreon</Link> (recurring)
        </li>
        <li>
          <Link href="https://buymeacoffee.com/Tyrrrz">BuyMeACoffee</Link> (one-time)
        </li>
        <li>
          Ethereum: <code>0xE52F3BD5375DB842e20c86f13dE99717929DE730</code>
        </li>
        <li>
          Bitcoin: <code>3HtgWiio8fzMpYTXiZVNrKiQSdXAEf7xet</code>
        </li>
        <li>
          <Link href="https://store.steampowered.com/wishlist/id/Tyrrrz">Steam Wishlist</Link>
        </li>
        <li>
          <Link href="https://merch4ukraine.org">Merch4Ukraine</Link>
        </li>
      </ul>

      <hr />

      <div className="section-header">Top supporters</div>

      <ul>
        {donations.map((donation) => (
          <li key={donation.name || '?' + donation.amount + donation.platform} className="donation">
            <div className="donation-name">{donation.name || '[ Anonymous ]'}</div>
            <div className="donation-info">
              <div className="label">
                <FiDollarSign strokeWidth={1} />
                <div>{donation.amount}</div>
              </div>

              <div className="label">
                <FiExternalLink strokeWidth={1} />
                <div>{donation.platform}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div>Total amount donated: ${totalDonatedAmount.toLocaleString()}</div>
    </Page>
  );
};

export const query = graphql`
  query {
    donations: allDonationsJson {
      nodes {
        name
        amount
        platform
      }
    }
  }
`;

export default DonatePage;
