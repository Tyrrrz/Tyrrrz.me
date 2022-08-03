import c from 'classnames';
import { FC, PropsWithChildren } from 'react';

type ListProps = PropsWithChildren<{
  variant?: 'unordered' | 'ordered';
  start?: number;
}>;

const List: FC<ListProps> = ({ variant = 'unordered', start = 1, children }) => {
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
      start={start}
    >
      {children}
    </RawList>
  );
};

export default List;
