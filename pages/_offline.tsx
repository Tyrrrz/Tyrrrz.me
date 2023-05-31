import { NextPage } from 'next';
import Heading from '~/components/heading';
import Meta from '~/components/meta';
import Paragraph from '~/components/paragraph';

const OfflinePage: NextPage = () => {
  return (
    <>
      <Meta title="Offline" />

      <section>
        <Heading>Offline</Heading>
        <Paragraph>
          Your device is currently offline. Please reconnect to the network to view this page.
        </Paragraph>
      </section>
    </>
  );
};

export default OfflinePage;
