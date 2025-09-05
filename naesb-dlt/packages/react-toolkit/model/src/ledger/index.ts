import { IBaseContract } from './base';

export * from './trade';
export * from './delivery';
export * from './invoice';
export * from './base';
export * from './facility';
export * from './commodity';

export interface ITransactionResponse<T> {
  txId: string;
  success: boolean;
  errors?: any;
  data?: T;
}

export interface ILedgerQueryResult<T> {
  data: Array<T>;
  fetchedRecords: number;
  bookmark?: string;
}

export interface ITransaction {
  id: string;
  signer: string;
  mspId: string;
  contract?: string;
  block_hash: string;
  channel_id: string;
  timestamp: Date;
  data: any;
}

export interface IBlock {
  hash: string;
  block_number: number;
  previous_hash: string;
  transactionCount: number;
}

export interface IChannel {
  ChannelId: string;
  Name?: string;
  CounterpartyId?: string;
  CounterpartyEndpoint?: string;
  Status?: ChannelStatus;
  NetworkStatus?: string;
  Contracts?: Array<IBaseContract>;
}

export enum ChannelStatus {
  INVITATION_SENT = 'Invitation Sent',
  INVITATION_RECEIVED = 'Invitation Received',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum ChannelInvitationResponse {
  APPROVE = 'Approve',
  REJECT = 'Reject',
}

export interface IChannelMember {
  ChannelId: string;
  MemberId: string;
}
