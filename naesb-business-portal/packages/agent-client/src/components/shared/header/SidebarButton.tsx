import {
  Link as RouterLink,
  MakeLinkOptions,
  useMatches,
} from '@tanstack/router';
import {
  ListItem,
  ListItemContent,
  ListItemButton,
  ListItemDecorator,
} from '@mui/joy';
import { useMemo, ReactNode } from 'react';

export interface SidebarButtonProps extends MakeLinkOptions {
  label: string;
  icon: ReactNode;
}

export const SidebarButton = ({
  label,
  to,
  params,
  search,
  icon,
}: SidebarButtonProps) => {
  const matches = useMatches();
  const active = useMemo(() => {
    const current = matches.find(
      (match) => match.route.fullPath.toUpperCase() === to.toUpperCase(),
    );
    return Boolean(current);
  }, [matches, to]);
  return (
    <ListItem>
      {/* @ts-ignore */}
      <ListItemButton
        component={RouterLink}
        variant={active ? 'soft' : undefined}
        color={active ? 'primary' : undefined}
        to={to}
        params={params}
        search={search}
        sx={{ borderRadius: 4 }}
      >
        <ListItemDecorator sx={{ color: active ? 'inherit' : 'neutral.500' }}>
          {icon}
        </ListItemDecorator>
        <ListItemContent>{label}</ListItemContent>
      </ListItemButton>
    </ListItem>
  );
};
