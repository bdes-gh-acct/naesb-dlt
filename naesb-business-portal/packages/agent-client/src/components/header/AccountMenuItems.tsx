import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
// @ts-ignore
import { useOrgMsp } from 'utils/auth';
import { useBusiness } from 'query/directory';
import { useWidth } from 'components/shared/util';

export const AccountMenuItems = () => {
  const currentWidth = useWidth();
  const { user } = useAuth0();
  const { mspId } = useOrgMsp();
  const { data: organization } = useBusiness(mspId);

  const isScreenSmall = () => {
    return ['xs', 'sm', 'md'].includes(currentWidth);
  };

  return (
    <>
      <List>
        <ListItem>
          {!isScreenSmall() ? (
            <ListItemAvatar>
              <Avatar src={user?.picture} sx={{ marginRight: 0 }} />
            </ListItemAvatar>
          ) : (
            <></>
          )}
          <ListItemText primary={user?.email} secondary={organization?.name} />
        </ListItem>
      </List>
      <Divider sx={{ mb: 1 }} />
    </>
  );
};
