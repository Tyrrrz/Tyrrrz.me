import { clsx } from "clsx";
import { FC, PropsWithChildren } from "react";
import { Link as RouterLink } from "react-router-dom";
import { isAbsoluteUrl } from "../utils/url";

type LinkProps = PropsWithChildren<{
  variant?: "normal" | "discreet" | "hidden";
  href: string;
  external?: boolean;
}>;

const Link: FC<LinkProps> = ({
  variant = "normal",
  href,
  external = isAbsoluteUrl(href),
  children,
}) => {
  const Proxy = external ? "a" : RouterLink;

  return (
    <Proxy
      className={clsx({
        "text-blue-500": variant === "normal",
        "dark:text-blue-300": variant === "normal",
        "hover:underline": variant === "normal",
        "hover:text-blue-500": variant === "discreet",
        "dark:hover:text-blue-300": variant === "discreet",
      })}
      href={href}
      target={external ? "_blank" : undefined}
      rel="noreferrer"
    >
      {children}
    </Proxy>
  );
};

export default Link;
