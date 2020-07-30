import React from 'react'
import useSiteMetadata from './hooks/useSiteMetadata'
import Link from './link'
import Layout from './layout'
import Meta from './meta'

export default () => {
  const siteMetadata = useSiteMetadata()

  return (
    <Layout>
      <Meta title='Donate' />

      <h2>Donate</h2>

      <p>
        If you found any of my projects useful and want to support me, please
        consider donating. This will motivate me to continue 😊
      </p>

      <ul>
        <li>
          <Link to={`https://patreon.com/${siteMetadata.patreon}`}>
            Patreon
          </Link>
        </li>
        <li>
          <Link to={`https://buymeacoffee.com/${siteMetadata.buymeacoffee}`}>
            Buy me a coffee
          </Link>
        </li>
        <li>
          Bitcoin (BTC): <code>{siteMetadata.bitcoin}</code>
        </li>
        <li>
          Ethereum (ETH): <code>{siteMetadata.ethereum}</code>
        </li>
      </ul>

      <p>I want to thank the following people for their particularly generous support 💜</p>
      <ul>
        <li>Peter Wesselius</li>
        <li>Mark Ledwich</li>
        <li>BouncingWalrus</li>
        <li>Thomas C</li>
        <li>Dominic Maas</li>
        <li>lupus</li>
        <li>Richard</li>
        <li>Foritus</li>
        <li>Michael Dayah</li>
        <li>Victor Smith</li>
        <li>Sprocketman1981</li>
      </ul>
    </Layout>
  )
}
