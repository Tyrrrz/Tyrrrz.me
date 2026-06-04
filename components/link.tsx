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
  const className = clsx({
    "text-blue-500": variant === "normal",
    "dark:text-blue-300": variant === "normal",
    "hover:underline": variant === "normal",
    "hover:text-blue-500": variant === "discreet",
    "dark:hover:text-blue-300": variant === "discreet",
  });

  if (external) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    );
  }

  return (
    <RouterLink className={className} to={href}>
      {children}
    </RouterLink>
  );
};

export default Link;
