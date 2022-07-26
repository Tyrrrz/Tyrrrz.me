import { FC, PropsWithChildren } from 'react';
import Box from './box';

type ListProps = PropsWithChildren<{
  variant?: 'unordered' | 'ordered';
}>;

const List: FC<ListProps> = ({ variant = 'unordered', children }) => {
  return (
    <Box
      classes={[
        'ml-4',
        {
          'list-disc': variant === 'unordered',
          'list-decimal': variant === 'ordered'
        }
      ]}
    >
      {children}
    </Box>
  );
};

export default List;
