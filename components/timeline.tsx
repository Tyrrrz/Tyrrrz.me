import c from 'classnames';
import { FC, PropsWithChildren } from 'react';

type TimelineProps = PropsWithChildren;

const Timeline: FC<TimelineProps> = ({ children }) => {
  return (
    <ul className={c('border-l-[2px]', 'border-purple-300', 'dark:border-purple-700', 'space-y-2')}>
      {children}
    </ul>
  );
};

export default Timeline;
