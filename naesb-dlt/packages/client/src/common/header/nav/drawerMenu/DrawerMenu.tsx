import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import { useAuth0 } from '@auth0/auth0-react';
import { isScreenSmall } from '@common/utils';
import { Drawer, Box, List, Divider } from '@mui/material';
import { IDrawerHeaders } from '@naesb/dlt-model';
// @ts-ignore
import { useWidth } from '@react/toolkit';
import { LogoutButton } from '../../auth/LogoutButton';
import { AccountMenuItems } from '../../profile/AccountMenuItems';
import { MenuItem } from '../shared/MenuItem';

interface IDrawerMenu {
  navItems: IDrawerHeaders[];
  isOpen: boolean;
  toggleMenu: () => void;
}

export const DrawerMenu: React.FC<IDrawerMenu> = ({
  navItems,
  isOpen,
  toggleMenu,
}) => {
  const { isAuthenticated } = useAuth0();
  const currentWidth = useWidth();
  const mobile = isScreenSmall(currentWidth);

  const createListItems = () => {
    return navItems.map((header: IDrawerHeaders) => {
      return (
        <MenuItem key={header.label} navItems={header} startOpen={false} />
      );
    });
  };

  if (!isAuthenticated) {
    return <></>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
      }}
    >
      <MenuOutlinedIcon
        sx={{ color: '#fff', justifySelf: 'flex-end' }}
        onClick={toggleMenu}
      />

      <Drawer
        anchor="left"
        open={isOpen}
        onClose={toggleMenu}
        variant={`${mobile ? 'persistent' : 'permanent'}`}
        PaperProps={{
          sx: { top: '64px' },
        }}
      >
        <Box
          sx={{
            height: 'calc(100% - 63.5px)',
            minWidth: '200px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          role="presentation"
        >
          <List>
            <AccountMenuItems />
            {createListItems()}
          </List>

          <Box pb={1}>
            <Divider sx={{ marginBottom: '10px' }} />
            <LogoutButton mobile />
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};
