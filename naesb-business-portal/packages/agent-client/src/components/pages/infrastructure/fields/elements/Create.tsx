import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { IField } from '@naesb/aries-types';
import { Form, TextField } from 'components/shared/form';
import { useCreateField } from 'query/field';
import { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';

export const CreateFieldDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) => {
  const onSuccess = useCallback(() => {
    setOpen(false);
  }, [setOpen]);
  const { mutateAsync } = useCreateField({ onSuccess });
  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog
        aria-labelledby="basic-modal-dialog-title"
        aria-describedby="basic-modal-dialog-description"
        sx={{
          minWidth: '50vw',
          borderRadius: 'md',
          p: 3,
          boxShadow: 'lg',
        }}
      >
        <Typography
          id="basic-modal-dialog-title"
          component="h2"
          level="inherit"
          fontSize="1.25em"
          mb="0.25em"
        >
          Create Field
        </Typography>
        <Typography
          id="basic-modal-dialog-description"
          mt={0.5}
          mb={2}
          textColor="text.tertiary"
        >
          Fill in the information about the field
        </Typography>
        <Form<IField> onSubmit={mutateAsync as SubmitHandler<IField>}>
          <Stack>
            <TextField label="API ID" name="id" autoFocus required />
            <TextField label="Name" name="name" required />
          </Stack>
        </Form>
      </ModalDialog>
    </Modal>
  );
};
