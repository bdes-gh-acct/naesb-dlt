import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import { useChannelOrganizations } from '@query/channels';
import { IOrganization } from '@naesb/dlt-model';
import { FC } from 'react';

export interface MspsProps {
  channelId: string;
}

export const Msps: FC<MspsProps> = ({ channelId }) => {
  const { data } = useChannelOrganizations(channelId);
  return (
    <>
      <Typography variant="h6" color="textSecondary">
        Members
      </Typography>
      <List>
        {data?.map((org: { msp_id: string; org: IOrganization }) => (
          <ListItem key={org.msp_id}>
            <ListItemAvatar>
              <Avatar
                alt={org.org.display_name}
                src={org.org.branding?.logo_url}
                sx={{
                  backgroundColor: 'white',
                }}
              />
            </ListItemAvatar>
            <ListItemText primary={org.org.display_name} />
          </ListItem>
        ))}
      </List>
    </>
  );
};
