import classNames, { Argument as ClassName } from 'classnames';
import { createElement, CSSProperties, FC, PropsWithChildren } from 'react';

type BoxProps = PropsWithChildren<{
  type?: string;
  classes?: ClassName[];
  style?: CSSProperties;
  innerHtml?: string;
}>;

const Box: FC<BoxProps> = ({ type = 'div', classes = [], style, innerHtml, children }) => {
  const className = classNames(classes) || undefined;
  return createElement(
    type,
    {
      className,
      style,
      dangerouslySetInnerHTML: { __html: innerHtml }
    },
    children
  );
};

export default Box;
