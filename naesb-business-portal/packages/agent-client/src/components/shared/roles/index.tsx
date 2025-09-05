import { Chip, ChipProps } from '@mui/joy';
import { IBusinessRoleJunction } from '@naesb/dlt-model';

export interface RolesProps {
  roles?: Array<IBusinessRoleJunction>;
  size?: ChipProps['size'];
}

export const Roles = ({ roles, size = 'sm' }: RolesProps) => {
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {roles?.map((role) => (
        <Chip
          size={size}
          color="neutral"
          variant="soft"
          sx={{ marginLeft: 1 }}
          key={`${role.businessId}-${role.businessRoleId}`}
        >
          {role.role?.Name}
        </Chip>
      ))}
    </>
  );
};
