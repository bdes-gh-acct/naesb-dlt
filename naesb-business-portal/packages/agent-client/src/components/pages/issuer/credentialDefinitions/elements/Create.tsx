import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { CreateCredentialDefinitionRequest } from '@naesb/aries-types';
import { Form, TextField } from 'components/shared/form';
import { SchemaAutocomplete } from 'components/shared/form/input/schemaAutocomplete';
import { useCreateCredentialDefinition } from 'query/credentialDefinitions';
import { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';

export const CreateCredentialDefinitionDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) => {
  const onSuccess = useCallback(() => {
    setOpen(false);
  }, [setOpen]);
  const { mutateAsync } = useCreateCredentialDefinition({ onSuccess });
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
            Create Certificate Definition
          </Typography>
          <Typography
            id="basic-modal-dialog-description"
            mt={0.5}
            mb={2}
            textColor="text.tertiary"
          >
            Certificate definitions configure the settings for issuing
            certificates using the selected schema
          </Typography>
          <Form<CreateCredentialDefinitionRequest>
            onSubmit={
              mutateAsync as SubmitHandler<CreateCredentialDefinitionRequest>
            }
            defaultValues={{
              support_revocation: true,
              revocation_registry_size: 1000,
              tag: 'Default',
            }}
          >
            <Stack>
              <SchemaAutocomplete
                label="Schema"
                name="schema_id"
                autoFocus
                required
              />
              <TextField label="Tag" name="tag" required />
              <TextField
                label="Max Certificate Count"
                name="revocation_registry_size"
                type="number"
                required
              />
            </Stack>
          </Form>
        </>
      </ModalDialog>
    </Modal>
  );
};
