import { Button } from '@mui/joy';

export const RegisterButton = () => (
  <Button
    component="a"
    color="primary"
    variant="outlined"
    href="/api/auth/signup"
  >
    Sign Up
  </Button>
);
