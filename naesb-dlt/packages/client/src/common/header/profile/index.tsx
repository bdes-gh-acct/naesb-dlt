import { useAuth0 } from '@auth0/auth0-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

export type ProfileProps = {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
};

const Profile: React.FC<ProfileProps> = ({ open, setOpen }) => {
  const { logout, user } = useAuth0();
  const history = useHistory();
  const logoutCb = useCallback(() => {
    localStorage.removeItem('auth_org_id');
    logout();
    history.push('/');
  }, [logout, history]);
  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>User Profile</DialogTitle>
      <DialogContent>
        <List>
          <Typography>{user?.given_name}</Typography>
          <Typography>{user?.family_name}</Typography>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={logoutCb} variant="contained">
          LOGOUT
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Profile;
