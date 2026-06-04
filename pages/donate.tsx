import { clsx } from "clsx";
import { FC } from "react";
import { FiDollarSign } from "react-icons/fi";
import Heading from "../components/heading";
import Inline from "../components/inline";
import Link from "../components/link";
import List from "../components/list";
import ListItem from "../components/listItem";
import Meta from "../components/meta";
import Paragraph from "../components/paragraph";
import { donations } from "virtual:donations";

const DonationPage: FC = () => {
  return (
    <>
      <Meta title="Donate" />

      <section>
        <Heading>Donate</Heading>

        <Paragraph>
          If you found the work I do useful and want to support me financially, please consider
          making a donation through one of the following platforms:
        </Paragraph>

        <List>
          <ListItem>
            <span className="font-semibold">
              <Link href="https://github.com/sponsors/Tyrrrz">GitHub Sponsors</Link>
            </span>{" "}
            (one-time or recurring)
          </ListItem>

          <ListItem>
            <Link href="https://patreon.com/Tyrrrz">Patreon</Link> (recurring)
          </ListItem>

          <ListItem>
            <span className="line-through">Buy Me A Coffee</span> (not supported anymore)
          </ListItem>
        </List>
      </section>

      {/* Donor list */}
      <section>
        <Heading level={2}>Top donors</Heading>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {donations.map((donation, i) => (
            <section
              key={i}
              className={clsx("rounded border p-4", {
                "border-purple-500": donation.amount >= 100,
                "border-purple-300": donation.amount >= 25 && donation.amount < 100,
                "dark:border-purple-700": donation.amount >= 25 && donation.amount < 100,
                "border-purple-100": donation.amount < 25,
                "dark:border-purple-900": donation.amount < 25,
              })}
            >
              <div className="text-lg">
                <Inline>
                  <FiDollarSign strokeWidth={1} />
                  <div>{donation.amount.toFixed(0)}</div>
                </Inline>
              </div>

              <div
                className={clsx("overflow-hidden text-ellipsis", {
                  "font-semibold": !!donation.name,
                })}
                title={donation.name}
              >
                {donation.name || "Anonymous"}
              </div>
              <div className="font-light">{donation.platform}</div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
};

export default DonationPage;
