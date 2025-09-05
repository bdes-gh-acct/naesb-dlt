import * as React from 'react';
import { IOrganization } from '@shared/model';
import { Button } from '@mui/joy/';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { TextField, Form } from '../shared/form';
import { ORGANIZATION_KEY } from '../../service/organization';
import { Dialog } from '../shared/dialog';

const schema = z.object({
  businessId: z.string(),
  did: z.string(),
  verKey: z.string(),
});

export const editOrganizationDid = async (
  data: IOrganization,
): Promise<IOrganization> => {
  const result = await axios.post<IOrganization, AxiosResponse<IOrganization>>(
    `/api/organizations/${data.businessId}/did`,
    data,
  );
  return result.data;
};

export const useEditOrganizationDid = (onSuccess: () => void) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: editOrganizationDid,
    onSuccess: () => {
      client.invalidateQueries([ORGANIZATION_KEY]);
      onSuccess();
    },
  });
};

export interface DidModalProps {
  organization?: IOrganization;
}

export default function DidModalEdit({ organization }: DidModalProps) {
  const [open, setOpen] = React.useState(false);
  const { mutateAsync } = useEditOrganizationDid(() => setOpen(false));
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Dialog
        title="Edit Organization"
        setOpen={setOpen}
        open={open}
        description="Update your organization's DID & VerKey"
      >
        <Form<IOrganization>
          onSubmit={(data: any) => {
            mutateAsync(data);
          }}
          resolver={zodResolver(schema)}
          defaultValues={organization}
        >
          <TextField name="did" label="DID" required />
          <TextField name="verKey" label="VerKey" required />
        </Form>
      </Dialog>
    </>
  );
}
