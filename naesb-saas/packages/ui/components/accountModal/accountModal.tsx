import * as React from 'react';
import { CompanyType, IOrganization, TaxNumberType } from '@shared/model';
import { Button } from '@mui/joy';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { TextField, Select, Form } from '../shared/form';
import { ORGANIZATION_KEY } from '../../service/organization';
import { Dialog } from '../shared/dialog';

const schema = z.object({
  name: z.string().min(1, 'Business Name is required'),
  address: z.string().min(1, 'Address is required'),
  website: z.string().url().min(1, 'Website is required'),
  taxNumber: z.coerce.string().min(1, 'Tax Number is required'),
  taxNumberType: z.nativeEnum(TaxNumberType),
  jurisdiction: z.string().optional(),
  companyType: z.nativeEnum(CompanyType),
  otherCompanyType: z.string().optional().nullable(),
  businessId: z.string().min(1, 'Business ID is required'),
});

export const editOrganization = async (
  data: IOrganization,
): Promise<IOrganization> => {
  const result = await axios.post<IOrganization, AxiosResponse<IOrganization>>(
    `/api/organizations/${data.businessId}`,
    data,
  );
  return result.data;
};

export const useEditOrganization = (onSuccess: () => void) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: editOrganization,
    onSuccess: () => {
      client.invalidateQueries([ORGANIZATION_KEY]);
      onSuccess();
    },
  });
};

const companies = Object.entries(CompanyType).map(([key, value]) => ({
  id: key,
  value,
}));

const taxNumberTypes = Object.entries(TaxNumberType).map(([key, value]) => ({
  id: key,
  value,
}));

export interface AccountModalProps {
  organization?: IOrganization;
}

export default function AccountModal({ organization }: AccountModalProps) {
  const [open, setOpen] = React.useState(false);
  const { mutateAsync } = useEditOrganization(() => setOpen(false));
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Edit
      </Button>

      <Dialog
        title="Edit Organization"
        setOpen={setOpen}
        open={open}
        description="Update details about your organization"
      >
        <Form<IOrganization>
          onSubmit={(data: any) => {
            mutateAsync(data);
          }}
          resolver={zodResolver(schema)}
          defaultValues={organization}
        >
          <TextField
            name="businessId"
            label="Business ID (EIN)"
            readOnly
            required
          />
          <TextField name="name" label="Business Name" required />
          <TextField name="address" label="Address" required />
          <TextField
            name="website"
            label="Website"
            required
            placeholder="https://example.com"
          />

          <Select
            options={taxNumberTypes}
            name="taxNumberType"
            label="Tax Number Type"
            valueKey="value"
            labelKey="value"
            required
          />
          <TextField name="taxNumber" label="Tax Number" />

          <TextField name="jurisdiction" label="Jurisdiction" />
          <Select
            options={companies}
            name="companyType"
            label="Company Type"
            valueKey="value"
            labelKey="value"
            required
          />
        </Form>
      </Dialog>
    </>
  );
}
