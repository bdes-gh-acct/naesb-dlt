import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { ToggleButtonInput } from '../toggleButton';

export const BuySellInput = () => {
  const { setValue, getValues } = useFormContext();
  const handleChange = useCallback(() => {
    const { SellerParty, BuyerParty } = getValues();
    setValue('BuyerParty', SellerParty);
    setValue('SellerParty', BuyerParty);
  }, [getValues, setValue]);
  return (
    <ToggleButtonInput
      name="Type"
      onChange={handleChange}
      buttons={[
        { value: 'Buy', content: 'Buy' },
        { value: 'Sell', content: 'Sell' },
      ]}
    />
  );
};
