import { ToggleButtonInput, useFormField } from '@common/form';
import { useCallback } from 'react';

export const BuySellInput = () => {
  const {
    input: { value: buyer, onChange: buyerOnChange },
  } = useFormField('BuyerParty');
  const {
    input: { value: seller, onChange: sellerOnChange },
  } = useFormField('SellerParty');
  const handleChange = useCallback(() => {
    sellerOnChange(buyer);
    buyerOnChange(seller);
  }, [buyer, seller, buyerOnChange, sellerOnChange]);
  return (
    <ToggleButtonInput
      name="Type"
      onChange={handleChange}
      exclusive
      fullWidth
      buttons={[
        { value: 'Buy', content: 'Buy' },
        { value: 'Sell', content: 'Sell' },
      ]}
    />
  );
};
