import React from 'react';
import { LinkProps } from 'react-router-dom';
import { Tab, TabProps } from '@mui/material';
import RouterLink from './RouterLink';

export type TabLinkProps = Omit<LinkProps, 'to'> &
  TabProps & { to?: LinkProps['to'] };

const TabLink: React.FC<TabLinkProps> = ({ to, value, icon, ...props }) => {
  return (
    <Tab
      icon={icon && icon}
      component={RouterLink}
      to={to ?? value}
      value={value}
      {...props}
    />
  );
};

export default TabLink;
