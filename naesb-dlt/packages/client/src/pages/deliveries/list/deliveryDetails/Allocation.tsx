import { Form } from '@common/form';
import { useCreateAllocation, useUpdateAllocation } from '@query/deliveries';
import {
  IDeliveryAllocation,
  IDelivery,
  ITradeViewModel,
} from '@naesb/dlt-model';
import { FORM_ERROR } from 'final-form';
import { FC, useMemo } from 'react';
import { object, array, number, mixed } from 'yup';
import { AllocationGrid } from './AllocationGrid';

export interface AllocationProps {
  delivery: IDelivery & {
    ChannelId: string;
    Allocations: Array<IDeliveryAllocation>;
  };
  trades: Array<ITradeViewModel & { Allocation: number }>;
}

const allocationSchema = object({
  trades: array().of(
    object({
      Allocation: number().test({
        message: 'Allocation cannot exceed trade quantity',
        test: (value, { options: { context } }) => {
          return Boolean(
            value === undefined ||
              Math.abs(Number(value)) <=
                (context?.delivery.ActualQuantity || 0),
          );
        },
      }),
    }),
  ),
  [FORM_ERROR]: mixed().test({
    message: 'Total allocation cannot exceed delivery quantity',
    test: (value, { parent, options: { context } }) => {
      const totalAllocation = parent.trades?.reduce(
        (acc: number, trade: any) => acc + Number(trade.Allocation),
        0,
      );
      return totalAllocation <= context?.delivery.ActualQuantity;
    },
  }),
});

export const Allocations: FC<AllocationProps> = ({ delivery, trades }) => {
  const values = useMemo(
    () => ({
      trades: trades.map((trade) => ({
        ...trade,
        Allocation:
          delivery.Allocations?.find((alloc) => alloc.DealId === trade.DealId)
            ?.Quantity || 0,
        DeliveryId: delivery.DeliveryId,
      })),
    }),
    [delivery, trades],
  );
  const { mutateAsync } = useCreateAllocation(delivery.ChannelId);
  const { mutateAsync: updateAsync } = useUpdateAllocation(delivery.ChannelId);
  return (
    <Form
      schema={allocationSchema}
      initialValues={values}
      context={{ delivery }}
      subscription={{ values: true, errors: true, error: true }}
      onSubmit={async ({
        trades: innerTrades,
      }: {
        trades: Array<ITradeViewModel & { Allocation: number }>;
      }) => {
        await Promise.allSettled([
          ...innerTrades
            .filter(
              (trade) =>
                trade.Allocation &&
                delivery.Allocations?.every(
                  (allocation) => allocation.DealId !== trade.DealId,
                ),
            )
            .map((trade) =>
              mutateAsync({
                Quantity: trade.Allocation,
                DeliveryId: delivery.DeliveryId,
                DealId: trade.DealId,
              }),
            ),
          trades
            .filter(
              (trade) =>
                trade.Allocation &&
                delivery.Allocations?.find(
                  (allocation) => allocation.DealId === trade.DealId,
                ),
            )
            .map((trade) =>
              updateAsync({
                Quantity: trade.Allocation,
                DeliveryId: delivery.DeliveryId,
                DealId: trade.DealId,
              }),
            ),
        ]);
      }}
    >
      <AllocationGrid />
    </Form>
  );
};
