import { FC, PropsWithChildren } from 'react';
import Box from './box';

const Header: FC<PropsWithChildren> = ({ children }) => {
  return <Box classes={['my-4', 'text-2xl', 'font-semibold']}>{children}</Box>;
};

export default Header;
