import { Commodity } from './commodity';

export interface IDelivery {
  ActualQuantity?: number;
  Allocations?: Array<IDeliveryAllocation>;
  Date: string;
  DeliveryId: string;
  DeliveryLocation: string;
  NominatedQuantity?: number;
  ScheduledQuantity?: number;
  ServiceRequestorParty: string;
  ReceivingParty: string;
  TspBusinessId: string;
  TspDeliveryId?: string;
  Commodity?: Commodity;
}

export interface ICreateDeliveryRequest {
  Date: string;
  TspDeliveryId?: string;
  DeliveryLocation: string;
  NominatedQuantity?: number;
  ReceivingParty: string;
  TspBusinessId: string;
}

export interface ISetScheduledQuantityRequest {
  ScheduledQuantity: number;
  DeliveryId: string;
}

export interface ISetActualQuantityRequest {
  ActualQuantity: number;
  DeliveryId: string;
}

export interface IAllocateDeliveryRequest {
  DeliveryId: string;
  Allocations: Array<Omit<IDeliveryAllocation, 'DeliveryId' | 'AllocationId'>>;
}

export interface ICreateDeliveryAllocationRequest {
  DeliveryId: string;
  Quantity: number;
  DealId: string;
}

export interface IUpdateDeliveryAllocationRequest {
  DeliveryId: string;
  Quantity: number;
  DealId: string;
}

export interface IDeliveryAllocation {
  AllocationId: string;
  DeliveryId: string;
  Quantity: number;
  DealId: string;
  Delivery?: IDelivery;
}
