import { useAuth0 } from '@auth0/auth0-react';
import { PageContainer } from '@common/page';
import { Box, Card } from '@mui/material';
import { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDeleteUser } from '@query/users';
import { ViewUser } from './view';
import { EditUser } from './edit';
import { AdminButtons } from './admin';

export const UserDetails = () => {
  const [editable, setEditable] = useState(false);
  const { userId } = useParams<any>();
  const { user } = useAuth0();
  const history = useHistory();

  const pushToUsers = () => history.push('/users');
  const { mutate } = useDeleteUser(userId, pushToUsers);

  const isUserAdmin = () => {
    return user
      ? user[`${process.env.REACT_APP_AUTH0_NAMESPACE_ROLES || ''}`]?.includes(
          'admin',
        )
      : false;
  };

  const canUserEdit = () => {
    return userId === user?.sub || isUserAdmin();
  };

  const deleteUser = async () => {
    mutate({});
  };

  return (
    <PageContainer
      title="User"
      size="md"
      action={
        canUserEdit() ? (
          <AdminButtons
            toggleEdit={() => setEditable(!editable)}
            deleteUser={deleteUser}
            userIsAdmin={isUserAdmin()}
            editText="Edit User"
            deleteText="Delete User"
          />
        ) : (
          <></>
        )
      }
    >
      <Box mt={2}>
        <Card sx={{ padding: 2, marginTop: 2 }}>
          {editable ? (
            <EditUser EditHandler={() => setEditable(!editable)} />
          ) : (
            <ViewUser />
          )}
        </Card>
      </Box>
    </PageContainer>
  );
};
