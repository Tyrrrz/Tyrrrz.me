import { graphql } from 'gatsby';
import React from 'react';
import { FiDollarSign, FiExternalLink } from 'react-icons/fi';
import Emoji from './components/Emoji';
import Link from './components/Link';
import Page from './components/Page';
import './Donate.css';

export const query = graphql`
  query {
    allDonationsJson {
      nodes {
        name
        amount
        platform
      }
    }
  }
`;

interface DonatePageProps {
  data: { allDonationsJson: GatsbyTypes.DonationsJsonConnection };
}

const DonatePage: React.FC<DonatePageProps> = ({ data }) => {
  const donations = [...data.allDonationsJson.nodes]
    .map((node) => ({
      name: node.name!,
      amount: node.amount!,
      platform: node.platform!
    }))
    .sort((a, b) => b.amount - a.amount);

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
      </ul>

      <hr />

      <div className="section-header">Top supporters</div>

      <ul>
        {donations.map((donation) => (
          <li key={donation.name} className="donation">
            <div className="donation-name">{donation.name}</div>
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
    </Page>
  );
};

export default DonatePage;
