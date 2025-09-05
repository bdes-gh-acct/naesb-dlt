/* eslint-disable no-param-reassign */
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Divider, Drawer } from '@mui/material';
import { IDrawerHeaders, IDrawerNavItem } from '@naesb/dlt-model';
import { useRouteMatch } from 'react-router-dom';
import { sidebarItems } from '@common/utils/nav_utils';
import { useState } from 'react';
import { LogoutButton } from '@common/header/auth/LogoutButton';
import { MenuItem } from '../shared/MenuItem';

export const drawerWidth = 240;

interface IDrawerMenu {
  isOpen: boolean;
  toggleMenu: () => void;
  drawerDirty: boolean;
}

const doStringsMatch = (stringA: string, stringB: string) => {
  return stringA.toLowerCase() === stringB.toLowerCase();
};

export const SideNav: React.FC<IDrawerMenu> = ({ isOpen, drawerDirty }) => {
  const { isAuthenticated } = useAuth0();
  const { path } = useRouteMatch();

  const getCurrentSideNav = () => {
    const rootPage = path.split('/');
    return sidebarItems.find((item: IDrawerHeaders) => {
      return item.label.toLowerCase() === rootPage[1].toLowerCase();
    });
  };
  const [nav, setNav] = useState(getCurrentSideNav());
  const handleSelectItem = (navItem: IDrawerNavItem) => {
    if (nav && nav.subMenu) {
      const newNav = {
        ...nav,
        subMenu: nav.subMenu.map((item: IDrawerNavItem) => {
          const stringsMatch = doStringsMatch(navItem.label, item.label);
          if (stringsMatch || (!stringsMatch && item.active)) {
            item.active = !item.active;
          }
          return item;
        }),
      };

      if (newNav) {
        setNav(newNav);
      }
    }
  };

  return (
    <Drawer
      transitionDuration={!drawerDirty ? 0 : undefined}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          marginTop: '64px',
          borderTop: '1px solid',
          borderTopColor: 'divider',
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="persistent"
      anchor="left"
      open={isAuthenticated && isOpen}
    >
      <Box
        sx={{
          width: '240px',
          display: 'flex',
          height: 'calc(100% - 64px)',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <MenuItem
            navItems={nav}
            key={nav?.label}
            selectItem={handleSelectItem}
            startOpen
          />
        </Box>

        <Box pb={1}>
          <Divider sx={{ marginBottom: '10px' }} />
          <LogoutButton mobile={false} />
        </Box>
      </Box>
    </Drawer>
  );
};
