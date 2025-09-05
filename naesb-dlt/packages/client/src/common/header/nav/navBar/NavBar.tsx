import { useAuth0 } from '@auth0/auth0-react';
import { Box } from '@mui/material';
import { IDrawerNavItem, IDrawerHeaders } from '@naesb/dlt-model';
import { NavLinkButton } from '../shared/NavLinkButton';

export interface INavBar {
  navItems: IDrawerNavItem[];
}

export const NavBar: React.FC<INavBar> = ({ navItems }) => {
  const { isAuthenticated } = useAuth0();

  const createNavItems = () => {
    return navItems.map((item: IDrawerHeaders) => {
      return (
        // @ts-ignore
        <NavLinkButton key={item.label} label={item.label} route={item.route} />
      );
    });
  };

  return (
    <>
      {isAuthenticated && (
        <Box
          sx={{
            '& a': {
              mx: 0.5,
            },
          }}
        >
          {createNavItems()}
        </Box>
      )}
    </>
  );
};
