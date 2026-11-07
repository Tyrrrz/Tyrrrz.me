import { FC } from "react";
import Link from "./link.tsx";

type UkraineAlertProps = { variant?: "default" | "frontline" };

const UkraineAlert: FC<UkraineAlertProps> = ({ variant = "default" }) => {
  if (variant === "frontline") {
    return (
      <section className="rounded border border-t-blue-500 border-r-yellow-400 border-b-yellow-400 border-l-blue-500 p-3 dark:border-t-blue-300 dark:border-r-yellow-500 dark:border-b-yellow-500 dark:border-l-blue-300">
        <p className="font-semibold">
          🪖 This article was written on the frontline of the{" "}
          <Link href="/ukraine">Russo-Ukrainian war</Link>
        </p>
      </section>
    );
  } else {
    return (
      <section className="rounded border border-t-blue-500 border-r-yellow-400 border-b-yellow-400 border-l-blue-500 p-3 dark:border-t-blue-300 dark:border-r-yellow-500 dark:border-b-yellow-500 dark:border-l-blue-300">
        <p className="font-semibold">
          💛 Thank you for supporting Ukraine in our <Link href="/ukraine">fight for freedom</Link>
        </p>
      </section>
    );
  }
};

export default UkraineAlert;
