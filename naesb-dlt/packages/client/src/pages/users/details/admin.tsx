import { Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export interface IAdminButtonsProps {
  toggleEdit: () => void;
  deleteUser?: () => void;
  userIsAdmin: boolean;
  editText: string;
  deleteText?: string;
}

export const AdminButtons: React.FC<IAdminButtonsProps> = ({
  toggleEdit,
  deleteUser,
  userIsAdmin,
  editText,
  deleteText,
}) => {
  return (
    <>
      <Button
        startIcon={<EditIcon />}
        onClick={() => toggleEdit()}
        color="primary"
        variant="contained"
        aria-label="edit user"
      >
        {editText}
      </Button>
      {userIsAdmin && deleteUser ? (
        <Button
          startIcon={<DeleteIcon />}
          onClick={() => deleteUser()}
          color="error"
          variant="contained"
          sx={{ marginLeft: '10px' }}
          aria-label="delete user"
        >
          {deleteText}
        </Button>
      ) : (
        <></>
      )}
    </>
  );
};
