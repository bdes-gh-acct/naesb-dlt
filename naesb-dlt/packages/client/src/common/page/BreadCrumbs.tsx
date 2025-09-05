import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export interface BreadcrumbsProps {
  items: Array<{ label: string; to?: string }>;
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <MuiBreadcrumbs aria-label="breadcrumb">
      {items.map((item) =>
        item.to ? (
          <Link underline="hover" color="inherit" component={RouterLink} to="/">
            {item.label}
          </Link>
        ) : (
          <Typography color="text.primary">{item.label}</Typography>
        ),
      )}
    </MuiBreadcrumbs>
  );
};
