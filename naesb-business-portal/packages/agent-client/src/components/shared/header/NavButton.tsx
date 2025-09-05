import {
  Link as RouterLink,
  MakeLinkOptions,
  useMatches,
} from '@tanstack/router';
import { Link, useTheme } from '@mui/joy';
import { useMemo } from 'react';

export interface NavButtonProps extends MakeLinkOptions {
  label: string;
}

export const NavButton = ({ label, to, params, search }: NavButtonProps) => {
  const matches = useMatches();
  const active = useMemo(() => {
    const [current] = matches.slice(-1);
    return current?.pathname.toUpperCase() === to.toUpperCase();
  }, [matches, to]);
  const theme = useTheme();
  return (
    // @ts-ignore
    <Link
      component={RouterLink}
      underline="none"
      to={to}
      params={params}
      search={search}
      sx={{
        fontFamily: 'Goldman',
        marginX: 1,
        color: theme.palette.text.secondary,
        fontSize: 18,
        '&:hover': { color: theme.palette.text.primary },
        ...(active && { color: theme.palette.text.primary }),
      }}
    >
      {label}
    </Link>
  );
};
