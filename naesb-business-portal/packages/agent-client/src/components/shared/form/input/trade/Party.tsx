import { FC } from 'react';
import { useWatch } from 'react-hook-form';
import { OrganizationLookup } from '../organization';

export interface PartyInputProps {
  name: 'BuyerParty' | 'SellerParty';
  label: string;
}

const sideMap = {
  Buy: 'BuyerParty',
  Sell: 'SellerParty',
};

export const PartyInput: FC<PartyInputProps> = ({ name, label }) => {
  const value = useWatch({ name: 'Type' });
  return (
    <OrganizationLookup
      name={name}
      label={label}
      disabled={sideMap[value as 'Buy' | 'Sell'] === name}
      requireChannel={sideMap[value as 'Buy' | 'Sell'] !== name}
    />
  );
};
