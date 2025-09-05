/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/naming-convention */
import { Box, Button } from '@mui/joy';
import { useSearchTrades } from 'query/trade';
import { useTspLocations } from 'query/tsp';
import { ITradeViewModel, QueryOperator } from '@naesb/dlt-model';
import { ColDef } from 'ag-grid-community';
import { keyBy } from 'lodash';
import {
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';
import {
  dateFormatter,
  priceFormatter,
} from 'components/shared/table/formatters';
import { useNavigate, useSearch } from '@tanstack/router';
import { BaseDatePicker } from 'components/shared/form/input/date';
import { DataGrid } from 'components/shared/table';
import { CreateTradeDialog } from 'components/shared/trade/Create';
import {
  DealIdCellRenderer,
  StatusCellRenderer,
} from 'components/shared/table/cellRenderers';
import { useDirectory } from 'query/directory';

const colDefs: Array<
  ColDef<ITradeViewModel & { Location: any; Organization: any }>
> = [
  {
    field: 'DealId',
    headerName: 'Deal ID',
    sortable: true,
    filter: true,
    floatingFilter: true,
    cellRenderer: DealIdCellRenderer,
    cellRendererParams: {
      to: '/Trades/$tradeId/Details',
    },
  },
  {
    field: 'Organization.name',
    headerName: 'Counterparty',
    flex: 1,
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
  {
    field: 'DeliveryPeriodStart',
    headerName: 'Start Date',
    flex: 1,
    sort: 'asc',
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
  },
  {
    field: 'DeliveryPeriodEnd',
    headerName: 'End Date',
    flex: 1,
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
  },
  {
    field: 'Type',
    headerName: 'Type',
    flex: 1,
    floatingFilter: true,
    filter: true,
  },
  {
    headerName: 'Status',
    field: 'Status',
    sortable: true,
    filter: true,
    floatingFilter: true,
    cellRenderer: StatusCellRenderer,
    maxWidth: 125,
  },
  {
    field: 'Location.locationName',
    headerName: 'Location',
    flex: 1,
    floatingFilter: true,
    filter: true,
    valueFormatter: ({ value, data }) => {
      return value || data?.DeliveryLocation;
    },
  },
  {
    field: 'PriceType',
    headerName: 'Price',
    valueFormatter: priceFormatter,
    flex: 1,
  },
  {
    field: 'MaxDailyQuantity',
    headerName: 'Qty/Day',
    flex: 1,
  },
];

export interface ActivityProps {
  setStartDate: Dispatch<SetStateAction<string | undefined>>;
  setEndDate: Dispatch<SetStateAction<string | undefined>>;
}

export const SearchTrades = () => {
  const { startDate, endDate } = useSearch();
  const navigate = useNavigate();
  const setStartDate = useCallback(
    (value?: string) => {
      navigate({ search: (search) => ({ ...search, startDate: value }) });
    },
    [navigate],
  );
  const setEndDate = useCallback(
    (value?: string) => {
      navigate({ search: (search) => ({ ...search, endDate: value }) });
    },
    [navigate],
  );
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const tradeQuery = useMemo(
    () => ({
      query: {
        DeliveryPeriodStart: {
          type: QueryOperator.LESS_THAN_OR_EQUAL,
          filter: endDate,
        },
        DeliveryPeriodEnd: {
          type: QueryOperator.MORE_THAN_OR_EQUAL,
          filter: startDate,
        },
      },
    }),
    [endDate, startDate],
  );
  const { data } = useSearchTrades(tradeQuery);
  const { data: directory } = useDirectory();
  const { data: locations } = useTspLocations();
  const rowData = useMemo(() => {
    const locationMap = keyBy(locations?.data || [], 'locationId');
    const directoryMap = keyBy(directory?.data || [], 'businessId');
    return data?.data.map((item) => {
      const row = item;
      const existing = locationMap[item.DeliveryLocation];
      const organization =
        directoryMap[item.Type === 'Sell' ? item.BuyerParty : item.SellerParty];
      // @ts-ignore
      return { ...row, Location: existing, Organization: organization };
    });
  }, [data?.data, locations?.data, directory?.data]);
  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mt={1}
      >
        <Box display="flex">
          <BaseDatePicker
            sx={{ marginRight: 2 }}
            label="Start"
            value={startDate ? new Date(startDate) : null}
            onChange={(value: Date | null) =>
              setStartDate(value?.toISOString() || undefined)
            }
          />
          <BaseDatePicker
            label="End"
            value={endDate ? new Date(endDate) : null}
            onChange={(value: Date | null) =>
              setEndDate(value?.toISOString() || undefined)
            }
          />
        </Box>
        <Button
          onClick={() => setCreateFormOpen(true)}
          variant="outlined"
          color="neutral"
          size="sm"
          sx={{ marginLeft: 2 }}
        >
          Create Trade
        </Button>
      </Box>
      <CreateTradeDialog
        open={createFormOpen}
        handleClose={() => setCreateFormOpen(false)}
      />
      <Box flexGrow={1} height="100%">
        <DataGrid<ITradeViewModel>
          columnDefs={colDefs}
          rowData={rowData}
          gridId="search-trades"
          getRowId={({ data: innerData }) => innerData.DealId}
        />
      </Box>
    </>
  );
};
