import { FC, PropsWithChildren } from 'react';
import Box from './box';
import RawLink from './rawlink';

type LinkProps = PropsWithChildren<{
  href: string;
}>;

const Link: FC<LinkProps> = ({ href, children }) => {
  return (
    <Box classes={['inline', 'text-blue-500', 'hover:underline']}>
      <RawLink href={href}>{children}</RawLink>
    </Box>
  );
};

export default Link;
