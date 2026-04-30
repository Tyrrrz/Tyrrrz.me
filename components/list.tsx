import { clsx } from "clsx";
import { FC, PropsWithChildren } from "react";

type ListProps = PropsWithChildren<{
  variant?: "unordered" | "ordered";
  start?: number;
}>;

const List: FC<ListProps> = ({ variant = "unordered", start = 1, children }) => {
  const Proxy = variant === "unordered" ? "ul" : "ol";

  return (
    <Proxy
      className={clsx("my-4 ml-8 list-outside", {
        "list-disc": variant === "unordered",
        "list-decimal": variant === "ordered",
      })}
      start={start}
    >
      {children}
    </Proxy>
  );
};

export default List;
