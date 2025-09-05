import { CompanyType, IOrganization, TaxNumberType } from '@shared/model';
import { Card, Typography } from '@mui/joy';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Select, Form } from '../shared/form';
import { useCreateOrganization } from '../../service/organization';

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

const companies = Object.entries(CompanyType).map(([key, value]) => ({
  id: key,
  value,
}));

const taxNumberTypes = Object.entries(TaxNumberType).map(([key, value]) => ({
  id: key,
  value,
}));

const defaultValues = {
  jurisdiction: 'United States',
  taxNumberType: TaxNumberType.US_FEDERAL,
};

const RegisterForm = () => {
  const { mutateAsync } = useCreateOrganization();
  return (
    <Card>
      <Typography level="title-lg" sx={{ marginBottom: 2 }}>
        Register Organization
      </Typography>
      <Form<IOrganization>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onSubmit={mutateAsync}
        resolver={zodResolver(schema)}
        defaultValues={defaultValues}
      >
        <TextField name="businessId" label="Business ID (EIN)" required />
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
    </Card>
  );
};

export default RegisterForm;
