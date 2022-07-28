import c from 'classnames';
import { FC, PropsWithChildren } from 'react';

type ListProps = PropsWithChildren<{
  variant?: 'unordered' | 'ordered';
}>;

const List: FC<ListProps> = ({ variant = 'unordered', children }) => {
  const RawList = variant === 'unordered' ? 'ul' : 'ol';

  return (
    <RawList
      className={c(
        'ml-4',
        {
          'list-disc': variant === 'unordered',
          'list-decimal': variant === 'ordered'
        },
        'list-inside'
      )}
    >
      {children}
    </RawList>
  );
};

export default List;
