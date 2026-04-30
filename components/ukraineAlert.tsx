import { FC } from "react";
import Link from "~/components/link";

const UkraineAlert: FC = () => {
  return (
    <section className="space-y-1 rounded border border-t-blue-500 border-r-yellow-400 border-b-yellow-400 border-l-blue-500 p-4 dark:border-t-blue-300 dark:border-r-yellow-500 dark:border-b-yellow-500 dark:border-l-blue-300">
      <div className="font-semibold">❤️ Thank You for Supporting Ukraine!</div>

      <div>
        As Russia wages a genocidal war against my country, I&apos;m grateful to everyone who
        continues to stand with Ukraine in our fight for freedom.
      </div>

      <div className="font-semibold">
        <Link href="/ukraine">See how you can help</Link>
      </div>
    </section>
  );
};

export default UkraineAlert;
