import { FC, PropsWithChildren } from 'react';
import Box from './box';

type TimelineItemProps = PropsWithChildren;

const TimelineItem: FC<TimelineItemProps> = ({ children }) => {
  return (
    <Box classes={['relative']}>
      <Box
        classes={[
          'absolute',
          'w-[8px]',
          'h-[8px]',
          '-left-[5px]',
          'top-3',
          'rounded-full',
          'bg-purple-500'
        ]}
      />
      <Box classes={['ml-4']}>{children}</Box>
    </Box>
  );
};

export default TimelineItem;
