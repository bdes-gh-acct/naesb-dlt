import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import FileUpload from 'react-material-file-upload';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

export interface IFileUploader {
  onUpload: () => void;
  handleClose: () => void;
  isOpen: boolean;
  title: string;
}

export const FileUploader: React.FC<IFileUploader> = ({
  onUpload,
  isOpen,
  handleClose,
  title,
}) => {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <Dialog
      open={isOpen}
      fullWidth
      maxWidth="md"
      onClose={handleClose}
      scroll="body"
    >
      <DialogContent>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {title}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <FileUpload value={files} onChange={setFiles} />

        <Button
          startIcon={<SaveIcon />}
          type="button"
          color="primary"
          variant="contained"
          aria-label="update user"
          sx={{
            marginTop: 2,
            maxWidth: '105px',
            padding: '6px 16px',
          }}
          onClick={onUpload}
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
};
