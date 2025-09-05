import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemDecorator,
  ListItemContent,
} from '@mui/joy';
import { IDirectory } from '@naesb/dlt-model';
import CheckIcon from '@mui/icons-material/Check';
import { useCreateConnection } from 'query/connections';
import { useCallback } from 'react';

export interface ConnectionStepCardProps {
  directory: IDirectory;
}

export const ConnectionStepCard = ({ directory }: ConnectionStepCardProps) => {
  const { mutateAsync, isLoading } = useCreateConnection();
  const handleClick = useCallback(() => {
    mutateAsync(directory?.did as string);
  }, [mutateAsync, directory]);
  return (
    <Box display="flex" justifyContent="center">
      <Card size="lg" variant="outlined">
        <CardContent orientation="horizontal">
          <CardContent>
            <Typography level="h3" sx={{ flex: 'auto', marginBottom: 1 }}>
              Connect
            </Typography>
            <List
              sx={{ '& > li': { alignItems: 'flex-start' }, marginBottom: 1 }}
            >
              <ListItem>
                <ListItemDecorator>
                  <CheckIcon />
                </ListItemDecorator>
                <ListItemContent>Send encrypted messages</ListItemContent>
              </ListItem>
              <ListItem>
                <ListItemDecorator>
                  <CheckIcon />
                </ListItemDecorator>
                <ListItemContent>Issue Credentials</ListItemContent>
              </ListItem>
              <ListItem>
                <ListItemDecorator>
                  <CheckIcon />
                </ListItemDecorator>
                <ListItemContent>Revoke Credentials</ListItemContent>
              </ListItem>
              <ListItem>
                <ListItemDecorator>
                  <CheckIcon />
                </ListItemDecorator>
                <ListItemContent>Present Credentials</ListItemContent>
              </ListItem>
              <ListItem>
                <ListItemDecorator>
                  <CheckIcon />
                </ListItemDecorator>
                <ListItemContent>Verify Credentials</ListItemContent>
              </ListItem>
            </List>
            <Button onClick={handleClick} loading={isLoading}>
              Connect
            </Button>
          </CardContent>
        </CardContent>
      </Card>
    </Box>
  );
};
