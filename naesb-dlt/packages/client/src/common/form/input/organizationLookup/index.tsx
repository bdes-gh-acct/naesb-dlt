import { AutocompleteProps } from '@mui/material';
import { useChannels } from '@query/channels';
import { useOrganizations } from '@query/organization';
import { Autocomplete } from '../autocomplete';

export interface OrganizationLookupProps {
  name: string;
  label: string;
  onChange?: AutocompleteProps<any, false, any, any>['onChange'];
}

export const OrganizationLookup: React.FC<OrganizationLookupProps> = ({
  name,
  label,
  onChange,
}) => {
  const { data: organizationData, isLoading: organizationsLoading } =
    useOrganizations();
  const { data, isLoading } = useChannels();
  const options = data?.data.map((channel) => {
    const organization = organizationData?.find(
      (org) => org.metadata?.msp_id === channel.Name,
    );
    return { ...channel, OrganizationName: organization?.display_name };
  });

  return (
    <Autocomplete
      isLoading={isLoading || organizationsLoading}
      options={organizationData ? options : undefined}
      name={name}
      label={label}
      onChange={onChange}
      labelKey="OrganizationName"
      valueKey="Name"
      variant="filled"
      getOptionLabel={(item: any) => item.OrganizationName}
    />
  );
};
