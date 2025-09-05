import { useDirectory } from 'query/directory';
import { useMemo } from 'react';
import { IDirectory } from '@naesb/dlt-model';
import { useFormContext } from 'react-hook-form';
import { useOrgMsp } from 'utils/auth';
import { Autocomplete, AutocompleteProps } from '../autocomplete';

export interface OrganizationLookupProps {
  name: string;
  label: string;
  onChange?: AutocompleteProps<any, false, any, any>['onChange'];
  disabled?: boolean;
  requireChannel?: boolean;
}

export const OrganizationLookup: React.FC<OrganizationLookupProps> = ({
  name,
  disabled,
  label,
  requireChannel,
}) => {
  const { data, isLoading } = useDirectory();
  const { mspId } = useOrgMsp();
  const options = useMemo(() => {
    return requireChannel
      ? data?.data.filter((row) => row.channel?.NetworkStatus === 'Active')
      : data?.data;
  }, [data, requireChannel]);
  const { setValue } = useFormContext();
  return (
    <Autocomplete<IDirectory, false>
      isLoading={isLoading}
      options={options || []}
      onChange={(_, value) => {
        if (value?.businessId !== mspId) {
          setValue('ChannelId', value?.channel?.ChannelId);
        }
      }}
      name={name}
      readOnly={disabled}
      label={label}
      labelKey="name"
      valueKey="businessId"
      getOptionLabel={(item) => (typeof item === 'string' ? item : item.name)}
    />
  );
};
