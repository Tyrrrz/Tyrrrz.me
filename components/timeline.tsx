import { FC, PropsWithChildren } from 'react';
import Box from './box';

type TimelineProps = PropsWithChildren;

const Timeline: FC<TimelineProps> = ({ children }) => {
  return <Box classes={['border-l-[2px]', 'border-purple-300', 'space-y-2']}>{children}</Box>;
};

export default Timeline;
