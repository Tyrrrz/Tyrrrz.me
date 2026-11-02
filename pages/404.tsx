import { FC } from "react";
import Heading from "../components/heading.tsx";
import Meta from "../components/meta.tsx";
import Paragraph from "../components/paragraph.tsx";

const NotFoundPage: FC = () => {
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
