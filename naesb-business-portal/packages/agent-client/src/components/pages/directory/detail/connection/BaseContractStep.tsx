import { Alert, Box, Card, CardContent, Grid, Typography } from '@mui/joy';
import { Commodity, IBaseContract, IDirectory } from '@naesb/dlt-model';
import { CreateBaseContractForm } from 'components/shared/contract/Create';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { useOrgMsp } from 'utils/auth';

export interface BaseContractStepProps {
  directory: IDirectory;
}

export const BaseContractStep = ({ directory }: BaseContractStepProps) => {
  const { mspId } = useOrgMsp();
  if (!directory) return <></>;
  return (
    <Box display="flex" justifyContent="center">
      <Card size="lg" variant="outlined" sx={{ width: '100%' }}>
        <CardContent orientation="horizontal">
          <Typography level="h3" sx={{ flex: 'auto', marginBottom: 1 }}>
            NAESB Base Contract
          </Typography>
        </CardContent>
        <CardContent orientation="vertical">
          {directory?.channel?.Contracts?.find(
            (contract) =>
              contract.Commodity === Commodity.NATURAL_GAS &&
              contract.Reviewing !== mspId,
          ) && (
            <Alert
              color="primary"
              variant="outlined"
              sx={{ marginBottom: 1 }}
              startDecorator={<InfoIcon />}
            >
              Counterparty is currently reviewing this contract
            </Alert>
          )}
          <Typography level="body-md" sx={{ flex: 'auto', marginBottom: 1 }}>
            This Base Contract incorporates by reference for all purposes the
            General Terms and Conditions for Sale and Purchase of Natural Gas
            published by the North American Energy Standards Board. The parties
            hereby agree to the following provisions offered in said General
            Terms and Conditions.
          </Typography>
        </CardContent>
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <Typography level="title-lg">Contract Settings</Typography>
              <CreateBaseContractForm
                channelId={directory?.channel?.ChannelId}
                counterPartyId={directory?.businessId}
                // @ts-ignore
                contract={directory?.channel?.Contracts?.find(
                  (contract: IBaseContract) =>
                    contract.Commodity === Commodity.NATURAL_GAS,
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Typography level="title-lg">
                General Terms & Conditions
              </Typography>
              <Card variant="outlined">
                <Typography level="title-md">
                  SECTION 1 - PURPOSE AND PROCEDURES
                </Typography>
                <Typography level="body-md">
                  1.1. These General Terms and Conditions are intended to
                  facilitate purchase and sale transactions of Gas on a Firm or
                  Interruptible basis. &quot;Buyer&quot; refers to the party
                  receiving Gas and &quot;Seller&quot; refers to the party
                  delivering Gas. The entire agreement between the parties shall
                  be the Contract as defined in Section 2.9.
                </Typography>
                <Typography level="body-md">
                  1.2. The parties will use the following Transaction
                  Confirmation procedure. Should the parties come to an
                  agreement regarding a Gas purchase and sale transaction for a
                  particular Delivery Period, the Confirming Party shall, and
                  the other party may, record that agreement in a Transaction
                  Confirmation on the NAESB Distributed Ledger Platform by the
                  close of the Business Day following the date of agreement. The
                  parties acknowledge that their agreement will not be binding
                  until the reviewing party approves the Transaction
                  Confirmation via DLT and the approval transaction is
                  successfully verified by the DLT network.
                </Typography>
                <Typography level="body-md">
                  1.3. If a sending party&lsquo;s Transaction Confirmation is
                  materially different from the receiving party&lsquo;s
                  understanding of the agreement referred to in Section 1.2,
                  such receiving party shall notify the sending party by
                  revising the Transaction Confirmation via the DLT by the
                  Confirm Deadline, unless such receiving party has previously
                  approved the Transaction Confirmation. Provided, for a
                  Transaction Confirmation using NAESB WGQ Standard No. 6.4.2
                  dataset sent via the DLT, the receiving party shall notify the
                  sending party via DLT of receiving party&lsquo;s acceptance or
                  dispute of the Transaction Confirmation. If there are any
                  material differences between timely sent Transaction
                  Confirmations governing the same transaction, then the
                  Transaction Confirmation shall not be binding until or unless
                  such differences are resolved including the use of any
                  evidence that clearly resolves the differences in the
                  Transaction Confirmations. In the event of a conflict among
                  the terms of (i) a binding Transaction Confirmation pursuant
                  to Section 1.2, (ii) the oral agreement of the parties which
                  may be evidenced by a recorded conversation, where the parties
                  have selected the Oral Transaction Procedure of the Base
                  Contract, (iii) the Base Contract, and (iv) these General
                  Terms and Conditions, the terms of the documents shall govern
                  in the priority listed in this sentence.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
