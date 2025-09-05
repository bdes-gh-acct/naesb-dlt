import { Box, Divider, FormLabel, Typography } from '@mui/joy';
import {
  ContractPaymentTypes,
  ContractPerformanceObligationTypes,
  ContractSpotPublisherTypes,
  ContractTaxPaymentDueByTypes,
} from '@naesb/dlt-model';
import { TextField } from '../form';
import { Select } from '../form/input/select';
import { OrganizationLookup } from '../form/input/organization';
import { ContractHelp } from './Help';
import { Checkbox } from '../form/input/checkbox';

export const BaseContractFormContent = () => {
  return (
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
        <FormLabel>Basic Info</FormLabel>
      </Box>
      <Box>
        <OrganizationLookup name="ReceivingParty" label="Party B" disabled />
        <TextField name="Commodity" label="Commodity" disabled />
      </Box>
      <Divider role="presentation" />
      <Box>
        <FormLabel>Confirmation</FormLabel>
      </Box>
      <Box>
        <TextField
          name="CommodityDetail.ConfirmDeadlineDays"
          label="Confirm Deadline"
          type="number"
          help={
            <ContractHelp
              items={[
                {
                  content: `"Confirm Deadline" shall mean 5:00 p.m. in the receiving party's time zone on the second Business Day following the Day a Transaction Confirmation is received or, if applicable, on the Business Day agreed to by the parties in the Base Contract; provided, if the Transaction Confirmation is time stamped after 5:00 p.m. in the receiving party's time zone, it shall be deemed received at the opening of the next Business Day`,
                  title: '2.7',
                },
              ]}
            />
          }
          helperText="Business days after receipt"
        />
      </Box>
      <Divider role="presentation" />
      <Box>
        <FormLabel>Payment</FormLabel>
      </Box>
      <Box>
        <Select
          options={ContractPerformanceObligationTypes}
          labelKey="DisplayName"
          valueKey="Code"
          help={
            <ContractHelp
              items={[
                {
                  content: `The sole and exclusive remedy of the parties in the event of a breach of a Firm obligation to deliver or receive Gas shall be recovery of the following: (i) in the event of a breach by Seller on any Day(s), payment by Seller to Buyer in an amount equal to the positive difference, if any, between the purchase price paid by Buyer utilizing the Cover Standard and the Contract Price, adjusted for commercially reasonable differences in transportation costs to or from the Delivery Point(s), multiplied by the difference between the Contract Quantity and the quantity actually delivered by Seller for such Day(s) excluding any quantity for which no replacement is available; or (ii) in the event of a breach by Buyer on any Day(s), payment by Buyer to Seller in the amount equal to the positive difference, if any, between the Contract Price and the price received by Seller utilizing the Cover Standard for the resale of such Gas, adjusted for commercially reasonable differences in transportation costs to or from the Delivery Point(s), multiplied by the difference between the Contract Quantity and the quantity actually taken by Buyer for such Day(s) excluding any quantity for which no sale is available; and (iii) in the event that Buyer has used commercially reasonable efforts to replace the Gas or Seller has used commercially reasonable efforts to sell the Gas to a third party, and no such replacement or sale is available for all or any portion of the Contract Quantity of Gas, then in addition to (i) or (ii) above, as applicable, the sole and exclusive remedy of the performing party with respect to the Gas not replaced or sold shall be an amount equal to any unfavorable difference between the Contract Price and the Spot Price, adjusted for such transportation to the applicable Delivery Point, multiplied by the quantity of such Gas not replaced or sold.  Imbalance Charges shall not be recovered under this Section 3.2, but Seller and/or Buyer shall be responsible for Imbalance Charges, if any, as provided in Section 4.3.  The amount of such unfavorable difference shall be payable five Business Days after presentation of the performing party’s invoice, which shall set forth the basis upon which such amount was calculated.`,
                  title: '3.2 - Cover Standard',
                },
                {
                  content: `The sole and exclusive remedy of the parties in the event of a breach of a Firm obligation to deliver or receive Gas shall be recovery of the following: (i) in the event of a breach by Seller on any Day(s), payment by Seller to Buyer in an amount equal to the difference between the Contract Quantity and the actual quantity delivered by Seller and received by Buyer for such Day(s), multiplied by the positive difference, if any, obtained by subtracting the Contract Price from the Spot Price; or (ii) in the event of a breach by Buyer on any Day(s), payment by Buyer to Seller in an amount equal to the difference between the Contract Quantity and the actual quantity delivered by Seller and received by Buyer for such Day(s), multiplied by the positive difference, if any, obtained by subtracting the applicable Spot Price from the Contract Price.  Imbalance Charges shall not be recovered under this Section 3.2, but Seller and/or Buyer shall be responsible for Imbalance Charges, if any, as provided in Section 4.3.  The amount of such unfavorable difference shall be payable five Business Days after presentation of the performing party’s invoice, which shall set forth the basis upon which such amount was calculated.`,
                  title: '3.2 - Spot Price Standard',
                },
              ]}
            />
          }
          name="CommodityDetail.PerformanceObligationType"
          label="Performance Obligation"
        />
        <Select
          options={ContractSpotPublisherTypes}
          labelKey="DisplayName"
          valueKey="Code"
          help={
            <ContractHelp
              items={[
                {
                  content: `"Spot Price" as referred to in Section 3.2 shall mean the price listed in the publication indicated on the Base Contract, under the listing applicable to the geographic location closest in proximity to the Delivery Point(s) for the relevant Day; provided, if there is no single price published for such location for such Day, but there is published a range of prices, then the Spot Price shall be the average of such high and low prices.  If no price or range of prices is published for such Day, then the Spot Price shall be the average of the following: (i) the price (determined as stated above) for the first Day for which a price or range of prices is published that next precedes the relevant Day; and (ii) the price (determined as stated above) for the first Day for which a price or range of prices is published that next follows the relevant Day.`,
                  title: '2.31',
                },
              ]}
            />
          }
          name="CommodityDetail.SpotPricePublication"
          label="Spot Price"
        />
        <Select
          help={
            <ContractHelp
              items={[
                {
                  content: `Seller shall pay or cause to be paid all taxes, fees, levies, penalties, licenses or charges imposed by any government authority (“Taxes”) on or with respect to the Gas prior to the Delivery Point(s).  Buyer shall pay or cause to be paid all Taxes on or with respect to the Gas at the Delivery Point(s) and all Taxes after the Delivery Point(s).  If a party is required to remit or pay Taxes that are the other party’s responsibility hereunder, the party responsible for such Taxes shall promptly reimburse the other party for such Taxes.  Any party entitled to an exemption from any such Taxes or charges shall furnish the other party any necessary documentation thereof.`,
                  title: '6 - Buyer pays at and after delivery point',
                },
                {
                  content: `Seller shall pay or cause to be paid all taxes, fees, levies, penalties, licenses or charges imposed by any government authority (“Taxes”) on or with respect to the Gas prior to the Delivery Point(s) and all Taxes at the Delivery Point(s).  Buyer shall pay or cause to be paid all Taxes on or with respect to the Gas after the Delivery Point(s).  If a party is required to remit or pay Taxes that are the other party’s responsibility hereunder, the party responsible for such Taxes shall promptly reimburse the other party for such Taxes.  Any party entitled to an exemption from any such Taxes or charges shall furnish the other party any necessary documentation thereof.`,
                  title: '6 - Seller pays before and at delivery point',
                },
              ]}
            />
          }
          options={ContractTaxPaymentDueByTypes}
          labelKey="DisplayName"
          valueKey="Code"
          name="CommodityDetail.TaxesDueBy"
          label="Taxes Paid By"
        />
        <TextField
          help={
            <ContractHelp
              items={[
                {
                  content: `Buyer shall remit the amount due under Section 7.1 in the manner specified in the Base Contract, in immediately available funds, on or before the later of the Payment Date or 10 Days after receipt of the invoice by Buyer; provided that if the Payment Date is not a Business Day, payment is due on the next Business Day following that date.  In the event any payments are due Buyer hereunder, payment to Buyer shall be made in accordance with this Section 7.2.`,
                  title: '7.2 - Payment Due Date',
                },
              ]}
            />
          }
          name="CommodityDetail.PaymentDate"
          label="Payment Due Date"
          type="number"
          helperText="Day of month following delivery"
        />
        <Select
          help={
            <ContractHelp
              items={[
                {
                  content: `Buyer shall remit the amount due under Section 7.1 in the manner specified in the Base Contract, in immediately available funds, on or before the later of the Payment Date or 10 Days after receipt of the invoice by Buyer; provided that if the Payment Date is not a Business Day, payment is due on the next Business Day following that date.  In the event any payments are due Buyer hereunder, payment to Buyer shall be made in accordance with this Section 7.2.`,
                  title: '7.2 - Payment Method',
                },
              ]}
            />
          }
          options={ContractPaymentTypes}
          labelKey="DisplayName"
          valueKey="Code"
          name="CommodityDetail.PaymentType"
          label="Payment Method"
        />
        <Checkbox
          help={
            <ContractHelp
              items={[
                {
                  content: `Unless the parties have elected on the Base Contract not to make this Section 7.7 applicable to this Contract, the parties shall net all undisputed amounts due and owing, and/or past due, arising under the Contract such that the party owing the greater amount shall make a single payment of the net amount to the other party in accordance with Section 7; provided that no payment required to be made pursuant to the terms of any Credit Support Obligation or pursuant to Section 7.3 shall be subject to netting under this Section.  If the parties have executed a separate netting agreement, the terms and conditions therein shall prevail to the extent inconsistent herewith.`,
                  title: '7.7 - Netting',
                },
              ]}
            />
          }
          name="CommodityDetail.Netting"
          label="Netting Applies"
        />
      </Box>
      <Divider role="presentation" />
      <Box>
        <FormLabel>Auto Allocation</FormLabel>
      </Box>
      <Box>
        <Checkbox
          name="CommodityDetail.AutoAllocation"
          label="Enable Auto Allocation"
        />
        <Checkbox
          name="CommodityDetail.AutoAllocationPrioritizeDaily"
          label="Prioritize Daily Deals"
        />
      </Box>
      <Divider role="presentation" />
      <Box>
        <FormLabel>Additional Info</FormLabel>
      </Box>
      <Box>
        <Checkbox
          name="CommodityDetail.CertifiedGas"
          label="Enable Certified Gas"
        />
      </Box>
      <Divider role="presentation" />
      <Box>
        <FormLabel>Terms & Conditions</FormLabel>
        <Typography level="body-sm">
          I have read and accept the General Terms & Conditions
        </Typography>
      </Box>
      <Box>
        <Checkbox name="Accept" label="I Accept" />
      </Box>
    </Box>
  );
};
