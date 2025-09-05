import { Box, Button, Skeleton } from '@mui/material';
import { useOrganization } from '@query/organization';

export const Organization: React.FC = () => {
  const { data } = useOrganization();
  return (
    <Box mr={1} display="flex">
      <Button color="inherit">
        {data ? data.display_name : <Skeleton width={42} />}
      </Button>
    </Box>
  );
};
