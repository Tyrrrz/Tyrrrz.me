import { clsx } from "clsx";
import { FC, PropsWithChildren } from "react";
import { FiLink } from "react-icons/fi";
import Link from "./link";

type HeadingProps = PropsWithChildren<{
  id?: string;
  level?: 1 | 2 | 3 | 4 | 5;
}>;

const Heading: FC<HeadingProps> = ({ id, level = 1, children }) => {
  const Proxy = `h${level}` as const;

  return (
    <Proxy
      id={id}
      className={clsx("group my-4 font-semibold", {
        "text-3xl": level === 1,
        "text-2xl": level === 2,
        "text-xl": level === 3,
        "text-lg": level === 4,
      })}
    >
      <span className={clsx({ "mr-2": !!id })}>{children}</span>

      {id && (
        <span className="text-base group-hover:visible sm:invisible">
          <Link href={`#${id}`}>
            <FiLink className="inline align-baseline" />
          </Link>
        </span>
      )}
    </Proxy>
  );
};

export default Heading;
