import React from 'react';

import useSiteMetadata from './hooks/useSiteMetadata';

import Layout from '../components/layout';
import Meta from '../components/meta';

export default () => {
  const siteMetadata = useSiteMetadata();

  return (
    <Layout>
      <Meta title="Donate" />

      <h2>Donate</h2>

      <p>
        If you found any of my projects useful and want to support me, please
        consider donating. This will put a smile on my face and motivate me to
        continue{' '}
        <span role="img" aria-label="Smile">
          😊
        </span>
      </p>

      <ul>
        <li>
          <a href={`https://patreon.com/${siteMetadata.patreon}`}>Patreon</a>
        </li>
        <li>
          <a href={`https://buymeacoffee.com/${siteMetadata.buymeacoffee}`}>
            Buy me a coffee
          </a>
        </li>
        <li>
          Bitcoin (BTC): <code>{siteMetadata.bitcoin}</code>
        </li>
        <li>
          Ethereum (ETH): <code>{siteMetadata.ethereum}</code>
        </li>
      </ul>

      <p>
        I want to thank the following people for their amazing support{' '}
        <span role="img" aria-label="Heart">
          ❤️
        </span>
      </p>
      <ul>
        <li>Mark Ledwich</li>
        <li>BouncingWalrus</li>
        <li>Peter Wesselius</li>
        <li>Thomas C</li>
      </ul>
    </Layout>
  );
};
