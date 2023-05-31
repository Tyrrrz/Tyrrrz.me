import { NextPage } from 'next';
import Heading from '~/components/heading';
import Meta from '~/components/meta';
import Paragraph from '~/components/paragraph';

const NotFoundPage: NextPage = () => {
  return (
    <>
      <Meta title="Not Found" />

      <section>
        <Heading>Not Found</Heading>
        <Paragraph>The page you requested does not exist</Paragraph>
      </section>
    </>
  );
};

export default NotFoundPage;
