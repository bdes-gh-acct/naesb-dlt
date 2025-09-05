import {
  IAllocateDeliveryRequest,
  IDeliveryAllocation,
  IDelivery,
  QueryOperator,
} from '@naesb/dlt-model';
import { FC, useMemo } from 'react';
import { Form } from 'components/shared/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAllocateDelivery } from 'query/deliveries';
import { Box } from '@mui/joy';
import { useSearchTrades } from 'query/trade';
import { AllocationGrid } from './AllocationGrid';
import { allocationSchema } from './schema';

export interface AllocationProps {
  delivery: IDelivery & {
    ChannelId: string;
    Allocations: Array<IDeliveryAllocation>;
  };
}

export const Allocations: FC<AllocationProps> = ({ delivery }) => {
  const { data: trades } = useSearchTrades({
    query: {
      DeliveryLocation: {
        type: QueryOperator.EQUALS,
        filter: delivery?.DeliveryLocation,
      },
      ChannelId: {
        type: QueryOperator.EQUALS,
        filter: delivery?.ChannelId,
      },
      DeliveryPeriodStart: {
        type: QueryOperator.LESS_THAN_OR_EQUAL,
        filter: delivery?.Date,
      },
      DeliveryPeriodEnd: {
        type: QueryOperator.MORE_THAN_OR_EQUAL,
        filter: delivery?.Date,
      },
    },
  });
  const values = useMemo(
    () => ({
      DeliveryId: delivery.DeliveryId,
      Allocations: trades?.data.map((trade) => ({
        ...trade,
        Quantity:
          delivery.Allocations?.find((alloc) => alloc.DealId === trade.DealId)
            ?.Quantity || 0,
        DeliveryId: delivery.DeliveryId,
      })),
    }),
    [delivery, trades],
  );
  const { mutateAsync } = useAllocateDelivery(delivery.ChannelId, (val) =>
    console.log(val),
  );
  if (!trades) return <></>;

  return (
    <Form
      resolver={zodResolver(allocationSchema)}
      defaultValues={values}
      onSubmit={async (value: IAllocateDeliveryRequest) => {
        try {
          await mutateAsync(value);
        } catch (e) {
          return e;
        }
        return undefined;
      }}
    >
      <Box pb={1}>
        <AllocationGrid delivery={delivery} />
      </Box>
    </Form>
  );
};
