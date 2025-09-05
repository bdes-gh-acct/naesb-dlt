import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
// @ts-ignore
import { Header as SharedHeader, useWidth } from '@react/toolkit';
import { isScreenSmall } from '@common/utils';
import { navbarItems, sidebarItems } from '@common/utils/nav_utils';
import { NavBar } from './nav/navBar/NavBar';
import { AccountMenu } from './profile/AccountMenu';
import Profile from './profile';
import { DrawerMenu } from './nav/drawerMenu/DrawerMenu';

export const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth0();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const currentWidth = useWidth();

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_org_id', user?.org_id);
    }
  }, [user]);

  const toggleMenu = () => setIsDrawerOpen(!isDrawerOpen);

  const createActions = () => {
    return (
      isAuthenticated && (
        <>
          <AccountMenu />
          <Profile open={profileOpen} setOpen={setProfileOpen} />
        </>
      )
    );
  };

  return (
    <SharedHeader
      nav={
        !isScreenSmall(currentWidth) ? (
          <NavBar navItems={navbarItems} />
        ) : (
          <DrawerMenu
            navItems={sidebarItems}
            toggleMenu={toggleMenu}
            isOpen={isDrawerOpen}
          />
        )
      }
      actions={!isScreenSmall(currentWidth) ? createActions() : <></>}
    />
  );
};
