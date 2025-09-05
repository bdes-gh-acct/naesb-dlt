import { Link, LinkProps } from 'react-router-dom';
import { FC, forwardRef } from 'react';

const RouterLink: FC<Omit<LinkProps, 'innerRef' | 'ref'>> = (props, ref) => (
  <Link innerRef={ref} {...props} />
);

// @ts-ignore
export default forwardRef(RouterLink);
