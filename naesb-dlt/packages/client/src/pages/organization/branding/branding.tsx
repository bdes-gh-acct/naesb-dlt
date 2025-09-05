import { Box, Typography, Grid } from '@mui/material';
import { TextField } from '@common/form';
// @ts-ignore
import { useWidth, FileUploader } from '@react/toolkit';
import { isScreenSmall } from '@common/utils';
import { useState } from 'react';
import { IOrganization } from '@naesb/dlt-model';
import EditIcon from '@mui/icons-material/Edit';

export interface IOrgBranding {
  editable: boolean;
  org: IOrganization;
  editHandler: () => void;
}

export const Branding: React.FC<IOrgBranding> = ({ editable, org }) => {
  const currentWidth = useWidth();
  const mobile = isScreenSmall(currentWidth);
  const [showModal, setShowModal] = useState(false);

  const handleUploadImage = () => {
    console.log('uploading');
  };

  return (
    <Box>
      <Typography variant="h6" component="h6" pt={2}>
        Organization Branding:
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginTop: '20px',
        }}
        onClick={() => setShowModal(!showModal)}
      >
        <img
          src={org?.branding?.logo_url}
          alt="organization logo"
          style={{
            maxWidth: '250px',
            maxHeight: '100px',
            backgroundColor: `${org?.branding.colors?.page_background}`,
            padding: '5px 10px',
            borderRadius: '5px',
            display: 'block',
          }}
        />
        {editable ? (
          <Box sx={{ display: 'block' }}>
            <Box
              sx={{
                position: 'absolute',
                width: '30px',
                height: '30px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                marginTop: '75px',
                marginLeft: '-20px',
              }}
            >
              <EditIcon
                sx={{
                  color: `${org?.branding.colors?.page_background}`,
                  width: '30px',
                  marginTop: '2px',
                }}
              />
            </Box>
          </Box>
        ) : (
          <></>
        )}
      </Box>

      <Grid container spacing={1} mt={3} mb={3} columns={!mobile ? 2 : 1}>
        <Grid item xs={1} key="primary_color">
          <TextField
            name="branding.colors.primary"
            label="Primary Color"
            disabled={!editable}
          />
        </Grid>

        <Grid item xs={1} key="page_background">
          <TextField
            name="branding.colors.page_background"
            label="Page Background"
            disabled={!editable}
          />
        </Grid>
      </Grid>
      <FileUploader
        title="Upload Image"
        isOpen={showModal}
        handleClose={() => setShowModal(!showModal)}
        onUpload={handleUploadImage}
      />
    </Box>
  );
};
