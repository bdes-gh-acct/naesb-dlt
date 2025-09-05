import { Backdrop, CircularProgress, useTheme } from '@mui/material';
import { useIsMutating } from 'react-query';

export const Mutating = () => {
  const isMutating = useIsMutating();
  const theme = useTheme();
  return (
    <>
      <Backdrop
        open={(isMutating || 0) > 0}
        sx={{ zIndex: theme.zIndex.tooltip + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};
