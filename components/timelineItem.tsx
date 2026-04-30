import { FC, PropsWithChildren } from "react";

type TimelineItemProps = PropsWithChildren;

const TimelineItem: FC<TimelineItemProps> = ({ children }) => {
  return (
    <li className="relative">
      <div className="absolute top-2 -left-[5px] h-[8px] w-[8px] rounded-full bg-purple-500 md:top-3" />
      <div className="ml-4">{children}</div>
    </li>
  );
};

export default TimelineItem;
