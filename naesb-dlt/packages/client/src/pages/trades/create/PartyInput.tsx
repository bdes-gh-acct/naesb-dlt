import { OrganizationLookup, TextField, useFormField } from '@common/form';
import { FC } from 'react';

export interface PartyInputProps {
  name: 'BuyerParty' | 'SellerParty';
  label: string;
}

const sideMap = {
  Buy: 'BuyerParty',
  Sell: 'SellerParty',
};

export const PartyInput: FC<PartyInputProps> = ({ name, label }) => {
  const {
    input: { value },
  } = useFormField('Type');
  const {
    input: { onChange },
  } = useFormField('ChannelId');
  return sideMap[value as 'Buy' | 'Sell'] === name ? (
    <TextField disabled fullWidth name="Party" label={label} />
  ) : (
    <OrganizationLookup
      name={name}
      onChange={(_, innerValue) => onChange(innerValue.ChannelId)}
      label={label}
    />
  );
};
