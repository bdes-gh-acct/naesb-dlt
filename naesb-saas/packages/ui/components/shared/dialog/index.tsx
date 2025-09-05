import { Typography, Modal, ModalDialog, Box } from '@mui/joy';
import { PropsWithChildren } from 'react';

export interface DialogProps {
  title: string;
  description?: string;
  setOpen: (open: boolean) => void;
  open: boolean;
  width?: string;
}

export const Dialog = ({
  open,
  setOpen,
  title,
  width = '50vw',
  description,
  children,
}: PropsWithChildren<DialogProps>) => (
  <Modal open={open} onClose={() => setOpen(false)}>
    <ModalDialog
      aria-labelledby="dialog-title"
      aria-describedby={description ? 'dialog-description' : undefined}
      sx={{
        width,
        borderRadius: 'md',
        p: 3,
        boxShadow: 'lg',
      }}
    >
      <Typography
        id="dialog-title"
        component="h2"
        level="inherit"
        fontSize="1.25em"
        mb="0.25em"
      >
        {title}
      </Typography>
      {description && (
        <Typography
          id="dialog-description"
          mt={0.5}
          mb={2}
          textColor="text.tertiary"
        >
          {description}
        </Typography>
      )}
      {<Box maxHeight="80vh" overflow="auto">
        {children}
      </Box>}
    </ModalDialog>
  </Modal>
);
