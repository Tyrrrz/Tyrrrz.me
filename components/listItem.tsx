import { FC, PropsWithChildren } from 'react';

type ListItemProps = PropsWithChildren;

const ListItem: FC<ListItemProps> = ({ children }) => {
  return <li>{children}</li>;
};

export default ListItem;
