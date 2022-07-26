import { FC, PropsWithChildren } from 'react';
import Box from './box';

type ListItemProps = PropsWithChildren;

const ListItem: FC<ListItemProps> = ({ children }) => {
  return <Box type="li">{children}</Box>;
};

export default ListItem;
