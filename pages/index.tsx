import { NextPage } from "next";
import { FaBluesky, FaGithub } from "react-icons/fa6";
import Heading from "~/components/heading";
import Image from "~/components/image";
import Link from "~/components/link";
import Paragraph from "~/components/paragraph";
import UkraineAlert from "~/components/ukraineAlert";

const now = Date.now();

const HomePage: NextPage = () => {
  const age = new Date(now - Date.parse("1995-04-28")).getUTCFullYear() - 1970;

  const githubStarUrl = "https://stars.github.com/profiles/tyrrrz";
  const microsoftMvpUrl = "https://credly.com/badges/04f634b6-189f-4bed-8acb-974541039ef9";

  return (
    <>
      <section className="flex flex-col items-center gap-6 md:flex-row-reverse md:items-start">
        <div className="w-48 flex-none md:mt-12 md:w-56">
          <Image src="/logo-trans.png" alt="picture" priority />
        </div>

        <div>
          <div className="text-center md:text-left">
            <Heading>👋 Hello!</Heading>
          </div>
          <Paragraph>
            My name is Oleksii, also known online as Tyrrrz. I&apos;m a {age}-year-old software
            developer from Kyiv, Ukraine.
          </Paragraph>
          <Paragraph>
            Currently, I work as a consultant, focusing on developer tooling and infrastructure,
            with background interest in cloud technologies, distributed systems, and web
            applications. I enjoy seeking out creative solutions to complex problems and building
            things that empower others to do the same.
          </Paragraph>
          <Paragraph>
            I&apos;m also an active member of the developer community, a{" "}
            <Link href={githubStarUrl}>GitHub Star</Link> and a{" "}
            <Link href={microsoftMvpUrl}>Microsoft MVP Alumnus</Link> — I spend most of my free time
            maintaining a few popular <Link href="/projects">open-source projects</Link>, speaking
            at various <Link href="/speaking">technical conferences</Link>, or sharing knowledge and
            experience on <Link href="/blog">my blog</Link>.
          </Paragraph>
        </div>
      </section>

      <section className="my-2">
        <UkraineAlert />
      </section>

      <div className="my-8 h-1 rounded bg-purple-500" />

      <section className="flex justify-center gap-3 text-2xl font-light">
        <Link variant="discreet" href="https://github.com/Tyrrrz">
          <div className="px-2">
            <FaGithub strokeWidth={1} />
          </div>
        </Link>
        <Link variant="discreet" href="https://bsky.app/profile/tyrrrz.me">
          <div className="px-2">
            <FaBluesky strokeWidth={1} />
          </div>
        </Link>
      </section>
    </>
  );
};

export default HomePage;
