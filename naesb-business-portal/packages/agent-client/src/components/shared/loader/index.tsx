import React from 'react';
import { CircularProgress, styled, Typography } from '@mui/joy';
import { useAuth0 } from '@auth0/auth0-react';

export interface ScreenLoadingProps {
  label?: string;
  loading: boolean;
}

const ModalBackdrop = styled('div', {
  name: 'JoyModal',
  slot: 'Backdrop',
  overridesResolver: (props, styles) => styles.backdrop,
})(({ theme }) => ({
  zIndex: 10000,
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  backgroundColor: theme.vars.palette.background.backdrop,
  WebkitTapHighlightColor: 'transparent',
  backdropFilter: 'blur(8px)',
}));

export const ScreenLoading = ({ loading, label }: ScreenLoadingProps) => {
  if (!loading) return <></>;
  return (
    // zIndex of tooltip + 1
    <ModalBackdrop>
      <CircularProgress color="neutral" />
      <Typography>{label}</Typography>
    </ModalBackdrop>
  );
};

export const Authenticating = () => {
  const { isLoading } = useAuth0();
  if (!isLoading) return <></>;
  return (
    // zIndex of tooltip + 1
    <ModalBackdrop>
      <CircularProgress color="neutral" />
    </ModalBackdrop>
  );
};
