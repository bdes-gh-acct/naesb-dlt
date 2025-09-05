import {
  ContractPaymentDateType,
  ContractPaymentType,
  ContractPerformanceObligationType,
  ContractTaxPaymentDueBy,
  IBaseContract,
  SpotPricePublication,
} from '@naesb/dlt-model';
import { FC, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrgMsp } from 'utils/auth';
import { useCreateBaseContract } from 'query/contract';
import { Form } from '../form';
import { baseContractSchema } from './schema';
import { BaseContractFormContent } from './FormContent';
import { AcceptButton } from './AcceptButton';

export interface CreateBaseContractFormProps {
  channelId?: string;
  counterPartyId?: string;
  contract?: IBaseContract;
}

export const CreateBaseContractForm: FC<CreateBaseContractFormProps> = ({
  channelId,
  counterPartyId,
  contract,
}) => {
  const { mutateAsync: initiateContract } = useCreateBaseContract(() =>
    console.log('success'),
  );
  const handleSubmit = useCallback(
    async (values: any) => {
      if (!contract) {
        try {
          await initiateContract(values);
        } catch (e) {
          return e;
        }
        return undefined;
      }
      return undefined;
    },
    [contract, initiateContract],
  );
  const { mspId } = useOrgMsp();
  if (!counterPartyId) {
    return <></>;
  }
  return (
    <Form
      onSubmitError={(errors) => console.log(errors)}
      resolver={zodResolver(baseContractSchema)}
      allowCleanSubmit
      submitLabel={contract ? 'Revise' : 'Initiate'}
      onSubmit={handleSubmit}
      submitActions={
        contract && contract.Reviewing === mspId ? (
          <AcceptButton channelId={channelId as string} />
        ) : undefined
      }
      submitProps={{ disabled: contract && contract.Reviewing !== mspId }}
      defaultValues={
        contract
          ? { ...contract, TextHash: 'testing' }
          : ({
              ChannelId: channelId,
              Commodity: 'NG',
              ReceivingParty: counterPartyId,
              TextHash: 'notarealvalue',
              CommodityDetail: {
                AutoAllocation: true,
                AutoAllocationPrioritizeDaily: true,
                CertifiedGas: false,
                Confidentiality: true,
                ConfirmDeadlineDays: 2,
                EarlyTerminationDamages: false,
                Netting: true,
                PaymentDate: 25,
                PaymentDateType: ContractPaymentDateType.DAY_OF_MONTH,
                PaymentType: ContractPaymentType.WIRE_TRANSFER,
                PerformanceObligationType:
                  ContractPerformanceObligationType.COVER,
                SpotPricePublication: SpotPricePublication.GAS_DAILY,
                TaxesDueBy: ContractTaxPaymentDueBy.SELLER,
              },
            } as any)
      }
    >
      <BaseContractFormContent />
    </Form>
  );
};
