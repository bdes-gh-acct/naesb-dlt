import { Backdrop, CircularProgress, useTheme, Card } from '@mui/material';
import { FC } from 'react';

export interface LoadingProps {
  open?: boolean;
}

export const Loading: FC<LoadingProps> = ({ open = true }) => {
  const theme = useTheme();
  return (
    <Card>
      <Backdrop
        open={open}
        sx={{
          zIndex: theme.zIndex.tooltip + 1,
          backgroundColor: 'background.default',
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Card>
  );
};
