import React from 'react';
import useSiteMetadata from './hooks/useSiteMetadata';
import Link from './link';
import Layout from './layout';
import Meta from './meta';

export default () => {
  const siteMetadata = useSiteMetadata();

  return (
    <Layout>
      <Meta title="Donate" />

      <h2>Donate</h2>

      <p>
        If you found any of my projects useful and want to support me, please consider donating. This will put a smile on my face and
        motivate me to continue 😊
      </p>

      <ul>
        <li>
          <Link to={`https://patreon.com/${siteMetadata.patreon}`}>Patreon</Link>
        </li>
        <li>
          <Link to={`https://buymeacoffee.com/${siteMetadata.buymeacoffee}`}>Buy me a coffee</Link>
        </li>
        <li>
          Bitcoin (BTC): <code>{siteMetadata.bitcoin}</code>
        </li>
        <li>
          Ethereum (ETH): <code>{siteMetadata.ethereum}</code>
        </li>
      </ul>

      <p>I want to thank the following people for their amazing support ❤️</p>
      <ul>
        <li>Mark Ledwich</li>
        <li>BouncingWalrus</li>
        <li>Peter Wesselius</li>
        <li>Thomas C</li>
      </ul>
    </Layout>
  );
};
