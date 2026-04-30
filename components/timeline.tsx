import { FC, PropsWithChildren } from "react";

type TimelineProps = PropsWithChildren;

const Timeline: FC<TimelineProps> = ({ children }) => {
  return (
    <ul className="space-y-2 border-l-2 border-purple-300 dark:border-purple-700">{children}</ul>
  );
};

export default Timeline;
