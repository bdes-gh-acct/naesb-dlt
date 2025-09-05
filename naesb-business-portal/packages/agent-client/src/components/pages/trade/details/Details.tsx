import { Box, Divider, FormLabel } from '@mui/joy';
import {
  PerformanceTypeCode,
  PerformanceTypes,
  PriceTypeCode,
  PriceTypes,
} from '@naesb/dlt-model';
import { useParams } from '@tanstack/router';
import { Form, TextField } from 'components/shared/form';
import { DisplayController } from 'components/shared/form/display';
import { DatePicker } from 'components/shared/form/input/date';
import { PriceIndexLookup } from 'components/shared/form/input/priceIndex';
import { Select } from 'components/shared/form/input/select';
import { useTrade } from 'query/trade';

export const TradeDetailsTab = () => {
  const { tradeId } = useParams();
  const { data } = useTrade(tradeId);

  return (
    <>
      {data && (
        <Form defaultValues={data} onSubmit={(vals) => console.log(vals)}>
          <Box
            sx={{
              pt: 3,
              display: 'grid',
              gridTemplateColumns: {
                xs: '100%',
                sm: 'minmax(120px, 30%) 1fr',
                lg: '280px 1fr',
              },
              columnGap: { xs: 2, sm: 3, md: 4 },
              rowGap: { xs: 2, sm: 2.5 },
              '& > hr': {
                gridColumn: '1/-1',
              },
            }}
          >
            <Box>
              <FormLabel>Basic Information</FormLabel>
            </Box>
            <Box>
              <TextField name="DealId" label="Deal ID" disabled />
              <TextField
                name="BuyerDealId"
                label="Buyer Deal ID"
                disabled={data?.Type !== 'Buy'}
              />
              <TextField
                name="SellerDealId"
                label="Seller Deal ID"
                disabled={data?.Type !== 'Sell'}
              />
            </Box>
            <Divider role="presentation" />
            <Box>
              <FormLabel>Delivery Period</FormLabel>
            </Box>
            <Box>
              <DatePicker name="DeliveryPeriodStart" label="Start" />
              <DatePicker name="DeliveryPeriodEnd" label="End" />
            </Box>
            <Divider role="presentation" />
            <Box>
              <FormLabel>Pricing</FormLabel>
            </Box>
            <Box>
              <Select
                options={PriceTypes}
                labelKey="DisplayName"
                valueKey="Code"
                name="PriceType"
                label="Price Type"
              />
              <DisplayController
                show={({ values }) => values?.PriceType === PriceTypeCode.FIXED}
              >
                <TextField
                  name="Price"
                  label="Price (USD/MMBtu)"
                  type="number"
                  fullWidth
                />
              </DisplayController>
              <DisplayController
                show={({ values }) => values?.PriceType === PriceTypeCode.INDEX}
              >
                <PriceIndexLookup name="PriceIndex" label="Index" />
                <TextField
                  name="PriceIndexDifferential"
                  label="Price Modifier (USD/MMBtu)"
                  type="number"
                  fullWidth
                />
              </DisplayController>
            </Box>
            <Divider role="presentation" />
            <Box>
              <FormLabel>Performance</FormLabel>
            </Box>
            <Box>
              <Select
                name="PerformanceType"
                labelKey="DisplayName"
                valueKey="Code"
                options={PerformanceTypes}
                label="Performance Type"
              />
              <DisplayController
                show={({ values }) =>
                  values?.PerformanceType === PerformanceTypeCode.FIRM_FIXED
                }
              >
                <TextField
                  name="FFQty"
                  label="Qty/Day (MMBtu)"
                  type="number"
                  fullWidth
                />
              </DisplayController>
              <DisplayController
                show={({ values }) =>
                  values?.PerformanceType === PerformanceTypeCode.FIRM_VARIABLE
                }
              >
                <TextField
                  name="FVMinQty"
                  label="Min Qty/Day (MMBtu)"
                  type="number"
                  fullWidth
                />
                <TextField
                  name="FVMaxQty"
                  label="Max Qty/Day (MMBtu)"
                  type="number"
                  fullWidth
                />
              </DisplayController>
              <DisplayController
                show={({ values }) =>
                  values?.PerformanceType === PerformanceTypeCode.INTERRUPTIBLE
                }
              >
                <TextField
                  name="ITMaxQty"
                  label="Max QTY/Day (MMBtu)"
                  type="number"
                  fullWidth
                />
              </DisplayController>
            </Box>
          </Box>
        </Form>
      )}
    </>
  );
};
