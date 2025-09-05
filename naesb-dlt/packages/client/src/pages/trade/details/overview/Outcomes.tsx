/* eslint-disable react/jsx-no-useless-fragment */
import { useFormField } from '@common/form';
import { Button } from '@mui/material';
import { useOrganization } from '@query/organization';
import { ChangeTypeStatusCode, ITradeViewModel } from '@naesb/dlt-model';
import { FC } from 'react';
import { useForm } from 'react-final-form';

export interface OutcomesProps {
  trade?: ITradeViewModel;
}

export const Outcomes: FC<OutcomesProps> = ({ trade }) => {
  const {
    input: { onChange },
  } = useFormField('ChangeType');
  const { data: organization } = useOrganization();

  const { submit } = useForm();
  const handleAccept = (code: ChangeTypeStatusCode) => () => {
    onChange(code);
    submit();
  };
  return trade &&
    organization &&
    organization.metadata.msp_id === trade.Reviewing ? (
    <>
      <Button
        onClick={handleAccept(ChangeTypeStatusCode.REVISE)}
        variant="contained"
        color="error"
        sx={{ mr: 2 }}
      >
        REVISE
      </Button>
      <Button
        onClick={handleAccept(ChangeTypeStatusCode.ACCEPT)}
        variant="contained"
        color="success"
      >
        ACCEPT
      </Button>
    </>
  ) : (
    <></>
  );
};
