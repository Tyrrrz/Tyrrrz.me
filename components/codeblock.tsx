import { FC, PropsWithChildren } from 'react';
import Box from './box';

type CodeblockProps = PropsWithChildren;

const Codeblock: FC<CodeblockProps> = ({ children }) => {
  return (
    <Box type="span" classes={['font-mono', 'bg-neutral-100']}>
      {children}
    </Box>
  );
};

export default Codeblock;
