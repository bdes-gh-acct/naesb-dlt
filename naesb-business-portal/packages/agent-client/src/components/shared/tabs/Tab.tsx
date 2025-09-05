import { FC } from 'react';
import { LinkOptions, Link } from '@tanstack/router';
import { Tab as MuiTab, TabProps as MuiTabProps } from '@mui/joy';

export type RouterTabProps = MuiTabProps & LinkOptions & { label: string };

const TabLink: FC<RouterTabProps> = ({ to, value, label, ...props }) => {
  return (
    // @ts-ignore
    <MuiTab component={Link} to={to ?? value} value={value} {...props}>
      {label}
    </MuiTab>
  );
};

export default TabLink;
