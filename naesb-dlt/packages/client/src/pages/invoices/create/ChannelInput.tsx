import { OrganizationLookup, useFormField } from '@common/form';
import { FC } from 'react';

export interface ChannelInputProps {
  name: 'BuyerParty' | 'SellerParty';
  label: string;
}

export const ChannelInput: FC<ChannelInputProps> = ({ name, label }) => {
  const {
    input: { onChange },
  } = useFormField('ChannelId');
  const {
    input: { onChange: receivingOnChange },
  } = useFormField('ReceivingParty');
  return (
    <OrganizationLookup
      name={name}
      onChange={(_, value) => {
        onChange(value?.ChannelId);
        receivingOnChange(value?.Name);
      }}
      label={label}
    />
  );
};
