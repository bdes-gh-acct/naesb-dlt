import { ITrade } from './trade';

export interface ITradeFacility {
  DealId: string;
  FacilityId: string;
  ChannelId: string;
  Trade?: ITrade;
  Facility?: IChannelFacility;
}

export interface IChannelFacility {
  FacilityId: string;
  ChannelId: string;
  Name: string;
  Type: string;
  Owner: string;
  ReceiptLocationId: string;
  Trades?: Array<ITradeFacility>;
}
