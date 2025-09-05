import NextLink from 'next/link';
import { Link, useTheme } from '@mui/joy';
import { useMemo } from 'react';
import { useRouter } from 'next/router';

export interface NavButtonProps {
  label: string;
  href: string;
}

export const NavButton = ({ label, href }: NavButtonProps) => {
  const router = useRouter();
  const active = useMemo(() => {
    const current = router.pathname;
    return current.toUpperCase() === href.toUpperCase();
  }, [href, router]);
  const theme = useTheme();
  return (
    <Link
      component={NextLink}
      underline="none"
      href={href}
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
