import Heading from '@/components/heading';
import Meta from '@/components/meta';
import Paragraph from '@/components/paragraph';
import type { NextPage } from 'next';

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
