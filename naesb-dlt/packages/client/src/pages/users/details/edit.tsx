import { IUser } from '@naesb/dlt-model';
import { Typography, Divider, Button, Grid, Box, Avatar } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { createUserSchema, Form, TextField } from '@common/form';
import { useUser, useUpdateUser } from '@query/users';
import { useParams } from 'react-router-dom';
import { Error } from '@common/error/error';
import { Loading } from '@common/loading/Loading';
import { useState } from 'react';
import { FileUploader } from '@react/toolkit';
import EditIcon from '@mui/icons-material/Edit';

export interface IEditUserProps {
  EditHandler: () => void;
}

export const EditUser: React.FC<IEditUserProps> = ({ EditHandler }) => {
  const { userId } = useParams<any>();
  const { data: user, isLoading, isError, error } = useUser(userId);
  const [showModal, setShowModal] = useState(false);
  const {
    mutate,
    isLoading: isUpdating,
    isError: isErrorUpdating,
    error: updatingError,
  } = useUpdateUser(userId);

  const setEditableUserObj = (): IUser => {
    return {
      email: user?.email,
      name: user?.name,
      nickname: user?.nickname,
      user_metadata: {
        attention: user?.user_metadata?.attention,
        base_contract_number: user?.user_metadata?.base_contract_number,
        fax_number: user?.user_metadata?.fax_number,
        im_carrier: user?.user_metadata?.im_carrier,
        im_id: user?.user_metadata?.im_id,
        phone_number: user?.user_metadata?.phone_number,
      },
    };
  };

  const handleUpdateUser = (event: React.FormEvent<HTMLFormElement>) => {
    mutate(event);
    EditHandler();
  };

  const formatHeader = (value: string) => {
    if (value.includes('user_metadata.')) {
      const test = value.split('.');
      test.shift();
      // eslint-disable-next-line no-param-reassign
      value = test.join('');
    }
    const splitValue = value.split('_');
    return splitValue
      .map((item) => {
        const splitItem = item.split('');
        splitItem[0] = splitItem[0].toUpperCase();
        return splitItem.join('');
      })
      .join(' ');
  };

  const returnTextField = (key: any) => {
    return (
      <Grid item xs={3} md={4} key={key}>
        <TextField name={key} label={formatHeader(key)} />
      </Grid>
    );
  };

  const renderInputs = (dataset: any) => {
    if (dataset) {
      return Object.keys(dataset).map((item) => {
        if (item !== 'user_metadata') {
          return returnTextField(item);
        }
        return Object.keys(dataset[item]).map((data) => {
          return returnTextField(`user_metadata.${data}`);
        });
      });
    }
    return undefined;
  };

  const handleUploadAvatar = () => {
    console.log('uploading');
  };

  if (isLoading || isUpdating) {
    return <Loading />;
  }

  if (isError || isErrorUpdating) {
    return <Error message={error?.message || updatingError?.message} />;
  }

  return (
    <>
      <Typography variant="h5" component="h5" pt={2}>
        Update User Information
      </Typography>
      <Divider />

      <Box>
        <Avatar
          src={user?.picture}
          alt="user-logo-editable"
          style={{ marginTop: '20px', width: 150, height: 150 }}
        />
        <Box sx={{ display: 'block' }}>
          <Box
            sx={{
              position: 'absolute',
              width: '30px',
              height: '30px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              marginTop: '-30px',
              marginLeft: '100px',
            }}
          >
            <EditIcon
              sx={{
                color: 'black',
                width: '30px',
                marginTop: '2px',
              }}
              onClick={() => setShowModal(!showModal)}
            />
          </Box>
        </Box>
      </Box>

      <Form
        schema={createUserSchema}
        onSubmit={handleUpdateUser}
        initialValues={setEditableUserObj()}
      >
        <Grid container spacing={2} mt={1} mb={3}>
          {renderInputs(setEditableUserObj())}
        </Grid>
        <Divider />
        <Button
          startIcon={<SaveIcon />}
          type="submit"
          color="primary"
          variant="contained"
          aria-label="update user"
          sx={{ marginTop: 2 }}
        >
          Update User
        </Button>
      </Form>

      <FileUploader
        title="Upload Image"
        isOpen={showModal}
        handleClose={() => setShowModal(!showModal)}
        onUpload={handleUploadAvatar}
      />
    </>
  );
};
