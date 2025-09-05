import { Box, Typography, Grid } from '@mui/material';
import { TextField } from '@common/form';
// @ts-ignore
import { useWidth } from '@react/toolkit';
import { isScreenSmall } from '@common/utils';

export interface IOrgProps {
  editable: boolean;
}

export const Details: React.FC<IOrgProps> = ({ editable }) => {
  const currentWidth = useWidth();
  const mobile = isScreenSmall(currentWidth);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '10px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: `${!mobile ? 'row' : 'column-reverse'}`,
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" component="h6" pt={2} pb={2}>
            Organization Details:
          </Typography>

          <Grid container spacing={2} mt={1} mb={3} columns={!mobile ? 3 : 1}>
            <Grid item md={1} key="org_id">
              <TextField name="id" label="ID" disabled />
            </Grid>
            <Grid item md={1} key="org_name">
              <TextField name="name" label="Name" disabled={!editable} />
            </Grid>

            <Grid item md={1} key="display_name">
              <TextField
                name="display_name"
                label="Display Name"
                disabled={!editable}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};
