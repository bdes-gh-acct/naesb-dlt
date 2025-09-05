import {
  Box,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  Skeleton,
  Typography,
} from '@mui/joy';
import Tooltip from '@mui/joy/Tooltip';
import Person from '@mui/icons-material/Person';
import { useAuth0 } from '@auth0/auth0-react';
import { useBusiness } from 'query/directory';
import { useOrgMsp } from 'utils/auth';
import { AccountMenuItems } from './AccountMenuItems';
import { LogoutButton } from './LogoutButton';

export const AccountMenu = () => {
  const { user } = useAuth0();
  const { mspId } = useOrgMsp();
  const { data: organization } = useBusiness(mspId);

  return (
    <Box display="flex">
      <Box textAlign="right" mr={1}>
        <Typography textAlign="right" level="body-md">
          {user?.email || <Skeleton>jane.doe@naesb.com</Skeleton>}
        </Typography>
        <Typography level="body-sm" textAlign="right">
          {organization?.name || <Skeleton>jane.doe@naesb.com</Skeleton>}
        </Typography>
      </Box>
      <Dropdown>
        <Tooltip title="Account settings">
          <MenuButton
            slots={{ root: IconButton }}
            slotProps={{ root: { variant: 'soft', color: 'neutral' } }}
          >
            <Person />
          </MenuButton>
        </Tooltip>
        <Menu sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}>
          <AccountMenuItems />
          <LogoutButton mobile={false} />
        </Menu>
      </Dropdown>
    </Box>
  );
};
