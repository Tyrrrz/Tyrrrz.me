import c from 'classnames';
import { FC, PropsWithChildren } from 'react';

type PreProps = PropsWithChildren;

const Pre: FC<PreProps> = ({ children }) => {
  return <pre className={c('p-4', 'border', 'rounded', 'bg-neutral-50')}>{children}</pre>;
};

export default Pre;
