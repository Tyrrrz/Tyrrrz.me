import c from 'classnames';
import { FC, PropsWithChildren } from 'react';

type TimelineItemProps = PropsWithChildren;

const TimelineItem: FC<TimelineItemProps> = ({ children }) => {
  return (
    <section className={c('relative')}>
      <div
        className={c(
          'absolute',
          'w-[8px]',
          'h-[8px]',
          '-left-[5px]',
          'top-3',
          'rounded-full',
          'bg-purple-500'
        )}
      />
      <div className={c('ml-4')}>{children}</div>
    </section>
  );
};

export default TimelineItem;
