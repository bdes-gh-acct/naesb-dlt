import { DatePicker, Select, TextField } from '@common/form';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
} from '@mui/material';
import { useState } from 'react';

const steps = [
  {
    label: 'Basic Info',
    component: (
      <Stack spacing={2}>
        <TextField
          name="BaseContractNumber"
          type="number"
          label="BASE CONTRACT NUMBER"
          fullWidth
        />
        <TextField name="DealId" type="number" label="DEAL NUMBER" fullWidth />
        <Select
          disabled
          name="BuyerTrader"
          label="BUYER"
          options={[
            { mspId: 'D188779862', name: 'Spire' },
            { mspId: 'D001883032', name: 'TVA' },
            { mspId: 'D272727272', name: 'EQT' },
          ]}
          labelKey="name"
          valueKey="mspId"
          fullWidth
        />
        <Select
          disabled
          name="SellerTrader"
          label="SELLER"
          options={[
            { mspId: 'D188779862', name: 'Spire' },
            { mspId: 'D001883032', name: 'TVA' },
            { mspId: 'D272727272', name: 'EQT' },
          ]}
          labelKey="name"
          valueKey="mspId"
          fullWidth
        />
      </Stack>
    ),
  },
  {
    label: 'Delivery',
    component: (
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid item sm={6}>
            <DatePicker name="DeliveryPeriodStart" label="BEGIN" fullWidth />
          </Grid>
          <Grid item sm={6}>
            <DatePicker name="DeliveryPeriodEnd" label="END" fullWidth />
          </Grid>
        </Grid>
        <TextField
          name="QtyDay"
          type="number"
          label="QUANTITY PER DAY"
          sx={{ width: 200 }}
        />
      </Stack>
    ),
  },
];

export const CreateTradeStepperForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const handleNext = () =>
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  const handleBack = () =>
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  return (
    <>
      <DialogContent sx={{ minHeight: '40vh' }}>
        <Stepper activeStep={activeStep}>
          {steps.map(({ label }) => {
            const stepProps = {};
            const labelProps = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        {activeStep !== steps.length && (
          <Box pt={3}>{steps[activeStep].component}</Box>
        )}
      </DialogContent>

      <DialogActions sx={{ paddingX: 3, paddingY: 2 }}>
        {activeStep !== 0 && (
          <Button variant="outlined" onClick={handleBack} disableElevation>
            Back
          </Button>
        )}
        <Button variant="contained" onClick={handleNext} disableElevation>
          NEXT
        </Button>
      </DialogActions>
    </>
  );
};
