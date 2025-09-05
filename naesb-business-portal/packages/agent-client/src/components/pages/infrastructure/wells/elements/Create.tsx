import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { IWell } from '@naesb/aries-types';
import { Form, TextField } from 'components/shared/form';
import { FieldAutocomplete } from 'components/shared/form/input/fieldAutocomplete';
import { useCreateWell } from 'query/wells';
import { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';

export const CreateWellDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) => {
  const onSuccess = useCallback(() => {
    setOpen(false);
  }, [setOpen]);
  const { mutateAsync } = useCreateWell({ onSuccess });
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
        <>
          <Typography
            id="basic-modal-dialog-title"
            component="h2"
            level="inherit"
            fontSize="1.25em"
            mb="0.25em"
          >
            Create Well
          </Typography>
          <Typography
            id="basic-modal-dialog-description"
            mt={0.5}
            mb={2}
            textColor="text.tertiary"
          >
            Fill in the information about the well
          </Typography>
          <Form<IWell> onSubmit={mutateAsync as SubmitHandler<IWell>}>
            <Stack>
              <FieldAutocomplete
                label="Field"
                name="fieldId"
                autoFocus
                required
              />
              <TextField label="API ID" name="id" required />
              <TextField label="Name" name="name" required />
            </Stack>
          </Form>
        </>
      </ModalDialog>
    </Modal>
  );
};
