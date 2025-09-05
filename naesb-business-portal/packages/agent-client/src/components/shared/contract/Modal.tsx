import { Box, Modal, ModalDialog, Typography } from '@mui/joy';
import { FC } from 'react';
import { CreateBaseContractForm } from './Create';

export interface ContractModalProps {
  open: boolean;
  handleClose: () => void;
  channelId?: string;
  counterPartyId?: string;
}

export const BaseContractModal: FC<ContractModalProps> = ({
  open,
  handleClose,
  channelId,
  counterPartyId,
}) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog sx={{ paddingX: 0, width: '60vw' }}>
        <Typography level="title-lg" sx={{ paddingX: 2 }}>
          Base Contract
        </Typography>
        <Box sx={{ overflowY: 'auto', overflowX: 'hidden' }} px={2}>
          {open && (
            <CreateBaseContractForm
              channelId={channelId}
              counterPartyId={counterPartyId}
            />
          )}
        </Box>
      </ModalDialog>
    </Modal>
  );
};
