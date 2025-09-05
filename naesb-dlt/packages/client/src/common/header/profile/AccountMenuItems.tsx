import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { useOrganization } from '@query/organization';
// @ts-ignore
import { useWidth } from '@react/toolkit';

export const AccountMenuItems = () => {
  const currentWidth = useWidth();
  const { user } = useAuth0();
  const { data: organization } = useOrganization();

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
          <ListItemText
            primary={user?.email}
            secondary={organization?.display_name}
          />
        </ListItem>
      </List>
      <Divider sx={{ mb: 1 }} />
    </>
  );
};
