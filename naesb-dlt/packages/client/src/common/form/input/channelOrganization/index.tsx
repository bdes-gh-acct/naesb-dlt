import { useChannelOrganizations } from '@query/channels';
import { Autocomplete, AutocompleteProps } from '../autocomplete';

export interface ChannelOrganizationLookupProps
  extends Omit<AutocompleteProps<any, false>, 'labelKey' | 'valueKey'> {
  channelId: string;
}

export const ChannelOrganizationLookup: React.FC<
  ChannelOrganizationLookupProps
> = ({ name, label, channelId, ...rest }) => {
  const { data, isLoading } = useChannelOrganizations(channelId);
  return (
    <Autocomplete
      {...rest}
      isLoading={isLoading}
      options={data?.filter((item: any) => item.msp_id !== 'D000000000')}
      name={name}
      label={label}
      labelKey="org.display_name"
      valueKey="msp_id"
      variant="filled"
    />
  );
};
