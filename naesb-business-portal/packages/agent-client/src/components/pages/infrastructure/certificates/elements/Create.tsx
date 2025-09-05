import { Box, Checkbox } from '@mui/joy';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { IWell } from '@naesb/aries-types';
import { Form } from 'components/shared/form';
import { DataGrid } from 'components/shared/table';
import { useCreateWell } from 'query/wells';
import { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';

const rowData: Array<any> = [
  {
    id: 'W-1',
    type: 'Well',
    certifier: 'MiQ',
    rating: 'A+',
    score: '120',
    proof: 'Verified',
  },
  {
    id: 'W-2',
    type: 'Well',
    certifier: 'Project Canary',
    rating: 'A',
    score: '115',
    proof: 'Verified',
  },
  {
    id: 'F-1',
    type: 'Field',
    certifier: 'EO',
    rating: 'A+',
    score: '119',
    proof: 'Verified',
  },
];
const columnDefs = [
  { headerName: 'Location ID', field: 'id' },
  { headerName: 'Type', field: 'type' },
  { headerName: 'Certifier', field: 'certifier' },
  { headerName: 'Rating', field: 'rating' },
  { headerName: 'Score', field: 'score' },
  { headerName: 'Proof', field: 'proof' },
];

export const TradeDialog = ({
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
            Trade Details
          </Typography>
          <Typography
            id="basic-modal-dialog-description"
            mt={0.5}
            mb={2}
            textColor="text.tertiary"
          >
            Fill in details about the trade
          </Typography>
          <Form<IWell> onSubmit={mutateAsync as SubmitHandler<IWell>}>
            <Stack>
              <Box
                sx={{
                  border: '1px solid',
                  padding: 2,
                  margin: 1,
                  borderRadius: 8,
                }}
              >
                <Typography
                  id="basic-modal-dialog-title"
                  level="title-md"
                  fontSize="1.25em"
                  mb="0.25em"
                >
                  Certified Gas Addendum
                </Typography>
                <Checkbox
                  label="The gas in this trade satisfies the certification requirements described in the base contract"
                  defaultChecked
                />
                <DataGrid rowData={rowData} columnDefs={columnDefs} />
              </Box>
            </Stack>
          </Form>
        </>
      </ModalDialog>
    </Modal>
  );
};
