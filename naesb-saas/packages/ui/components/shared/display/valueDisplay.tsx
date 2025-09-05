import { Typography, Box } from '@mui/joy';

export interface ValueDisplayProps {
  label: string;
  value?: string | number;
}

export const ValueDisplay = ({ label, value }: ValueDisplayProps) => (
  <Box
    py={1}
    sx={{
      display: 'flex',
      gap: 0.5,
    }}
  >
    <Typography
      sx={{
        fontWeight: 'bold',
      }}
    >
      {label}
      {': '}
    </Typography>
    <Typography>{value} </Typography>
  </Box>
);
