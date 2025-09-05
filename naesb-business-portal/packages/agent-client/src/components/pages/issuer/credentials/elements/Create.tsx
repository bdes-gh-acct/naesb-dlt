import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { Form, TextField } from 'components/shared/form';
import { ConnectionAutocomplete } from 'components/shared/form/input/connectionAutocomplete';
import { CredentialDefinitionAutocomplete } from 'components/shared/form/input/credentialDefinitionAutocomplete';
import { DatePicker } from 'components/shared/form/input/date';
import { Select } from 'components/shared/form/input/select';
import { addYears } from 'date-fns';
import { useCreateCredential } from 'query/credential';
import { useCallback } from 'react';

const defaultDate = addYears(new Date(), 1).toISOString();
const effectiveDate = new Date().toISOString();

const targetTypes = [
  { id: 'Field', name: 'Field' },
  { id: 'Well', name: 'Well' },
];

export const IssueCredentialDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) => {
  const onSuccess = useCallback(() => {
    setOpen(false);
  }, [setOpen]);
  const { mutateAsync } = useCreateCredential({ onSuccess });
  const handleSubmit = useCallback(
    async (values: any) => {
      const { payload, ...rest } = values;
      try {
        mutateAsync({
          ...rest,
          payload: {
            ...payload,
            effective: new Date(payload.effective).valueOf().toString(),
            expiration: new Date(payload.expiration).valueOf().toString(),
          },
        });
      } catch (e) {
        return e;
      }
      return undefined;
    },
    [mutateAsync],
  );
  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog
        aria-labelledby="basic-modal-dialog-title"
        aria-describedby="basic-modal-dialog-description"
        sx={{
          minWidth: '50vw',
          maxHeight: '70vh',
          borderRadius: 'md',
          overflow: 'auto',
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
            Issue Certificate
          </Typography>
          <Typography
            id="basic-modal-dialog-description"
            mt={0.5}
            mb={2}
            textColor="text.tertiary"
          >
            Issue a certificate to a connected party
          </Typography>
          <Form<any>
            onSubmit={handleSubmit}
            defaultValues={{
              payload: {
                effective: effectiveDate,
                expiration: defaultDate,
                target_type: 'Well',
              },
            }}
          >
            <Stack>
              <ConnectionAutocomplete
                label="Connection"
                name="connectionId"
                autoFocus
                required
              />
              <CredentialDefinitionAutocomplete
                label="Certificate Definition"
                name="credentialDefinitionId"
                autoFocus
                required
              />

              <TextField
                label="Certificate ID"
                name="payload.certificate_id"
                required
              />
              <Select
                options={targetTypes}
                label="Type"
                name="payload.target_type"
                required
                valueKey="id"
                labelKey="name"
              />
              <TextField label="API ID" name="payload.target_id" required />
              <TextField label="Name" name="payload.target_name" required />
              <TextField label="Rating" name="payload.rating" required />
              <TextField label="Score" name="payload.score" required />
              <DatePicker label="Effective" name="payload.effective" useUtc />
              <DatePicker label="Expiration" name="payload.expiration" useUtc />
              <TextField label="Comment" name="comment" />
            </Stack>
          </Form>
        </>
      </ModalDialog>
    </Modal>
  );
};
