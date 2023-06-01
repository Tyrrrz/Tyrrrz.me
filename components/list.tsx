import c from 'classnames';
import { FC, PropsWithChildren } from 'react';

type ListProps = PropsWithChildren<{
  variant?: 'unordered' | 'ordered';
  start?: number;
}>;

const List: FC<ListProps> = ({ variant = 'unordered', start = 1, children }) => {
  const Proxy = variant === 'unordered' ? 'ul' : 'ol';

  return (
    <Proxy
      className={c(
        'ml-8',
        'my-4',
        {
          'list-disc': variant === 'unordered',
          'list-decimal': variant === 'ordered'
        },
        'list-outside'
      )}
      start={start}
    >
      {children}
    </Proxy>
  );
};

export default List;
