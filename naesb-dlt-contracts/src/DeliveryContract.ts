/* eslint-disable @typescript-eslint/no-inferrable-types */
import {
  Context,
  Contract,
  Info,
  Returns,
  Transaction,
} from 'fabric-contract-api';
import { Delivery, QueryResult } from './Delivery';
import { DeliveryAllocation } from './DeliveryAllocation';
import { ALLOCATION, DELIVERY } from './model';
import { baseDeliverySchema } from './DeliverySchema';
import { getKeyHistory, processResultset, validate } from './util';
import {
  allocationSchema,
  saveAllocationsSchema,
} from './DeliveryAllocationSchema';
import { KeyHistory } from './History';

@Info({ title: 'DeliveryContract', description: 'NAESB Delivery Contract' })
export class DeliveryContract extends Contract {
  private nonAdminCommands = [
    'init',
    'DeliveryContract:exists',
    'DeliveryContract:getDelivery',
    'DeliveryContract:getDeliveryHistory',
    'DeliveryContract:listDeliveriesByLocation',
    'DeliveryContract:createAllocation',
    'DeliveryContract:updateAllocation',
    'DeliveryContract:saveAllocations',
    'DeliveryContract:getAllocation',
    'DeliveryContract:listDeliveries',
    'DeliveryContract:createDelivery',
  ];

  private adminCommands = [
    'init',
    'DeliveryContract:exists',
    'DeliveryContract:getDelivery',
    'DeliveryContract:getDeliveryHistory',
    'DeliveryContract:deleteDelivery',
    'DeliveryContract:listDeliveriesByLocation',
    'DeliveryContract:getAllocation',
    'DeliveryContract:listDeliveries',
    'DeliveryContract:setScheduledQuantity',
    'DeliveryContract:setActualQuantity',
    'DeliveryContract:updateDeliverySchedule',
  ];

  constructor() {
    super('DeliveryContract');
  }

  public async beforeTransaction(ctx: Context) {
    const tx = ctx.stub.getFunctionAndParameters().fcn;
    const mspId = ctx.clientIdentity.getMSPID();
    if (mspId !== 'D000000000' && !this.nonAdminCommands.includes(tx)) {
      throw new Error(
        `The participant belonging to MSP: ${mspId} cannot invoke transaction: ${tx}`,
      );
    } else if (mspId === 'D000000000' && !this.adminCommands.includes(tx)) {
      throw new Error(
        `The participant belonging to MSP: ${mspId} cannot invoke transaction: ${tx}`,
      );
    }
  }

  /**
   * Perform any setup of the ledger that might be required
   * @param {Context} ctx the transaction context
   */
  @Transaction()
  public async init(ctx: Context) {
    console.log('Upgrading the delivery contract');
  }

  @Transaction(false)
  @Returns('boolean')
  public async exists(ctx: Context, key: string): Promise<boolean> {
    const buffer = await ctx.stub.getState(key);
    return !!buffer && buffer.length > 0;
  }

  @Transaction()
  @Returns('Delivery')
  public async createDelivery(ctx: Context, input: string): Promise<Delivery> {
    const inputJSON = JSON.parse(input) as any;
    const deliveryKey = ctx.stub.createCompositeKey(DELIVERY, [
      inputJSON.DeliveryId,
    ]);
    const {
      Date,
      DeliveryId,
      NominatedQuantity,
      ReceivingParty,
      TspBusinessId,
      TspDeliveryId,
      DeliveryLocation,
      Commodity,
    } = await validate(baseDeliverySchema(ctx), inputJSON);
    const delivery = new Delivery();
    delivery.Date = Date;
    delivery.DeliveryId = DeliveryId;
    delivery.TspDeliveryId = TspDeliveryId;
    delivery.NominatedQuantity = NominatedQuantity;
    delivery.DeliveryLocation = DeliveryLocation;
    delivery.Revision = 0;
    delivery.Commodity = Commodity;
    delivery.ServiceRequestorParty = ctx.clientIdentity.getMSPID();
    delivery.TspBusinessId = TspBusinessId;
    delivery.ReceivingParty = ReceivingParty;
    const buffer = Buffer.from(JSON.stringify(delivery));
    await ctx.stub.putState(deliveryKey, buffer);
    await ctx.stub.setEvent('DeliveryEvent', buffer);
    return delivery;
  }

  @Transaction()
  @Returns('Delivery')
  public async setScheduledQuantity(
    ctx: Context,
    input: string,
  ): Promise<Delivery> {
    const inputJSON = JSON.parse(input) as any;
    const { ScheduledQuantity, DeliveryId } = inputJSON;
    const delivery = await this.getDelivery(ctx, DeliveryId);
    delivery.ScheduledQuantity = ScheduledQuantity;
    const buffer = Buffer.from(JSON.stringify(delivery));
    const deliveryKey = ctx.stub.createCompositeKey(DELIVERY, [DeliveryId]);
    await ctx.stub.putState(deliveryKey, buffer);
    await ctx.stub.setEvent('DeliveryScheduleEvent', buffer);
    return delivery;
  }

  @Transaction()
  @Returns('Delivery')
  public async setActualQuantity(
    ctx: Context,
    input: string,
  ): Promise<Delivery> {
    const inputJSON = JSON.parse(input) as any;
    const { ActualQuantity, DeliveryId } = inputJSON;
    const delivery = await this.getDelivery(ctx, DeliveryId);
    delivery.ActualQuantity = ActualQuantity;
    const buffer = Buffer.from(JSON.stringify(delivery));
    const deliveryKey = ctx.stub.createCompositeKey(DELIVERY, [DeliveryId]);
    await ctx.stub.putState(deliveryKey, buffer);
    await ctx.stub.setEvent('DeliveryScheduleEvent', buffer);
    return delivery;
  }

  @Transaction()
  @Returns('Delivery')
  public async updateDeliverySchedule(
    ctx: Context,
    input: string,
  ): Promise<Delivery> {
    const inputJSON = JSON.parse(input) as any;
    const { ActualQuantity, ScheduledQuantity, DeliveryId } = inputJSON;
    const delivery = await this.getDelivery(ctx, DeliveryId);
    delivery.ActualQuantity = ActualQuantity;
    delivery.ScheduledQuantity = ScheduledQuantity;
    const buffer = Buffer.from(JSON.stringify(delivery));
    const deliveryKey = ctx.stub.createCompositeKey(DELIVERY, [DeliveryId]);
    await ctx.stub.putState(deliveryKey, buffer);
    await ctx.stub.setEvent('DeliveryScheduleEvent', buffer);
    return delivery;
  }

  @Transaction()
  @Returns(ALLOCATION)
  public async createAllocation(
    ctx: Context,
    input: string,
  ): Promise<DeliveryAllocation> {
    const inputJSON = JSON.parse(input) as DeliveryAllocation;
    const { DeliveryId, DealId, Quantity } = await validate(
      // @ts-ignore
      allocationSchema(ctx),
      inputJSON,
    );
    const allocationKey = ctx.stub.createCompositeKey(ALLOCATION, [
      DeliveryId,
      DealId,
    ]);
    const exists = await this.exists(ctx, allocationKey);
    if (exists) {
      throw new Error(
        `Allocation for deal ${DealId} already exists for delivery ${DeliveryId}`,
      );
    }
    const delivery = await this.getDelivery(ctx, DeliveryId);
    const mspId = ctx.clientIdentity.getMSPID();
    if (delivery.ServiceRequestorParty !== mspId) {
      throw new Error(
        `Delivery allocations can only be created by Service Requestor`,
      );
    }
    const allocations = await this.getDeliveryAllocationsByDeliveryId(
      ctx,
      DeliveryId,
    );
    const totalAllocatedQuantity = allocations.reduce(
      (sum: number, alloc) => sum + alloc.Quantity,
      Quantity,
    );
    if (totalAllocatedQuantity > (delivery.ActualQuantity || 0)) {
      throw new Error(
        `Sum of allocated quantity: ${totalAllocatedQuantity} exceeds delivery quantity ${delivery.ActualQuantity}`,
      );
    }
    const allocation = new DeliveryAllocation();
    allocation.DeliveryId = DeliveryId;
    allocation.DealId = DealId;
    allocation.Quantity = Quantity;
    const buffer = Buffer.from(JSON.stringify(allocation));
    await ctx.stub.putState(allocationKey, buffer);
    await ctx.stub.setEvent('DeliveryAllocationEvent', buffer);
    return allocation;
  }

  // Zero out instead of delete for traceability in invoicing
  private async zeroOutAllocation(
    ctx: Context,
    allocation: DeliveryAllocation,
  ) {
    const allocationKey = ctx.stub.createCompositeKey(ALLOCATION, [
      allocation.DeliveryId,
      allocation.DealId,
    ]);
    allocation.Quantity = 0;
    await ctx.stub.putState(
      allocationKey,
      Buffer.from(JSON.stringify(allocation)),
    );
  }

  private async saveAllocation(
    ctx: Context,
    deliveryId: string,
    allocation: DeliveryAllocation,
  ) {
    allocation.DeliveryId = deliveryId;
    const allocationKey = ctx.stub.createCompositeKey(ALLOCATION, [
      allocation.DeliveryId,
      allocation.DealId,
    ]);
    await ctx.stub.putState(
      allocationKey,
      Buffer.from(JSON.stringify(allocation)),
    );
    return allocation;
  }

  @Transaction()
  @Returns(ALLOCATION)
  public async saveAllocations(
    ctx: Context,
    input: string,
  ): Promise<Array<DeliveryAllocation>> {
    const inputJSON = JSON.parse(input) as {
      DeliveryId: string;
      Allocations: Array<Omit<DeliveryAllocation, 'DeliveryId'>>;
    };
    const { DeliveryId, Allocations } = await validate(
      saveAllocationsSchema(ctx, inputJSON.DeliveryId),
      inputJSON,
    );
    const existingAllocations = await this.getDeliveryAllocationsByDeliveryId(
      ctx,
      DeliveryId,
    );

    // save updated allocations
    await Promise.all(
      existingAllocations
        .filter((existing) =>
          Allocations.every(
            (newAllocation) => newAllocation.DealId !== existing.DealId,
          ),
        )
        .map((allocationToDelete) =>
          this.zeroOutAllocation(ctx, allocationToDelete),
        ),
    );
    const SavedAllocations = await Promise.all(
      Allocations.map((allocation) =>
        // @ts-ignore
        this.saveAllocation(ctx, DeliveryId, allocation),
      ),
    );
    const buffer = Buffer.from(
      JSON.stringify({ DeliveryId, Allocations: SavedAllocations }),
    );
    await ctx.stub.setEvent('DeliveryAllocationsEvent', buffer);
    return SavedAllocations;
  }

  @Transaction()
  @Returns(ALLOCATION)
  public async updateAllocation(
    ctx: Context,
    input: string,
  ): Promise<DeliveryAllocation> {
    const inputJSON = JSON.parse(input) as any;
    const { DeliveryId, DealId, Quantity } = await validate(
      // @ts-ignore
      allocationSchema(ctx),
      inputJSON,
    );
    const allocationKey = ctx.stub.createCompositeKey(ALLOCATION, [
      DeliveryId,
      DealId,
    ]);
    const allocation = await this.getAllocation(ctx, DeliveryId, DealId);
    const delivery = await this.getDelivery(ctx, DeliveryId);
    const allocations = await this.getDeliveryAllocationsByDeliveryId(
      ctx,
      DeliveryId,
    );
    const totalAllocatedQuantity = allocations
      .filter((all) => all.DealId !== DealId)
      .reduce((sum: number, alloc) => sum + alloc.Quantity, Quantity);
    if (totalAllocatedQuantity > (delivery.ActualQuantity || 0)) {
      throw new Error(
        `Sum of allocated quantity: ${totalAllocatedQuantity} exceeds delivery quantity ${delivery.ActualQuantity}`,
      );
    }
    allocation.Quantity = Quantity;
    const buffer = Buffer.from(JSON.stringify(allocation));
    await ctx.stub.putState(allocationKey, buffer);
    await ctx.stub.setEvent('DeliveryAllocationEvent', buffer);
    return allocation;
  }

  @Transaction(false)
  @Returns('QueryResult')
  public async listDeliveriesByLocation(
    ctx: Context,
    request: string,
  ): Promise<QueryResult> {
    const {
      DeliveryLocation,
      Date,
      pageSize = 100,
      bookmark,
    } = JSON.parse(request);
    const selector: any = {};
    if (DeliveryLocation) {
      selector.DeliveryLocation = DeliveryLocation;
    }
    if (Date) {
      selector.Date = Date;
    }
    const deliveries = {
      selector,
      use_index: ['_design/locationIndexDoc', 'locationIndex'],
    };
    const resultSet =
      DeliveryLocation || Date
        ? await ctx.stub.getQueryResultWithPagination(
            JSON.stringify(deliveries),
            pageSize,
            bookmark,
          )
        : await ctx.stub.getStateByRangeWithPagination(
            '',
            '',
            pageSize,
            bookmark,
          );

    const data = await processResultset(resultSet.iterator);
    return {
      data: JSON.stringify(data),
      fetchedRecords: resultSet.metadata.fetchedRecordsCount,
      bookmark: resultSet.metadata.bookmark,
    };
  }

  @Transaction(false)
  @Returns('QueryResult')
  public async listDeliveriesByDate(
    ctx: Context,
    request: string,
  ): Promise<QueryResult> {
    const { start, end, pageSize = 100, bookmark } = JSON.parse(request);
    const conditions = [];
    if (start) {
      conditions.push({ Date: { $gte: start } });
    }
    if (end) {
      conditions.push({ Date: { $lte: end } });
    }
    const selector = {
      $and: conditions,
    };
    const deliveries = {
      selector,
      use_index: ['_design/deliveryDateIndexDoc', 'deliveryDateIndex'],
    };
    const resultSet =
      // @ts-ignore
      DeliveryLocation || Date
        ? await ctx.stub.getQueryResultWithPagination(
            JSON.stringify(deliveries),
            pageSize,
            bookmark,
          )
        : await ctx.stub.getStateByRangeWithPagination(
            '',
            '',
            pageSize,
            bookmark,
          );

    const data = await processResultset(resultSet.iterator);
    return {
      data: JSON.stringify(data),
      fetchedRecords: resultSet.metadata.fetchedRecordsCount,
      bookmark: resultSet.metadata.bookmark,
    };
  }

  @Transaction(false)
  @Returns(DELIVERY)
  public async getDelivery(
    ctx: Context,
    DeliveryId: string,
  ): Promise<Delivery> {
    const deliveryKey = ctx.stub.createCompositeKey(DELIVERY, [DeliveryId]);
    const exists = await this.exists(ctx, deliveryKey);
    if (!exists) {
      throw new Error(`The delivery ${DeliveryId} does not exist`);
    }
    const buffer = await ctx.stub.getState(deliveryKey);
    const delivery = JSON.parse(buffer.toString()) as Delivery;
    return delivery;
  }

  @Transaction(false)
  @Returns(ALLOCATION)
  public async getAllocation(
    ctx: Context,
    DeliveryId: string,
    DealId: string,
  ): Promise<DeliveryAllocation> {
    const allocationKey = ctx.stub.createCompositeKey(ALLOCATION, [
      DeliveryId,
      DealId,
    ]);
    const exists = await this.exists(ctx, allocationKey);
    if (!exists) {
      throw new Error(
        `The allocation ${DealId} for delivery ${DeliveryId} does not exists`,
      );
    }
    const buffer = await ctx.stub.getState(allocationKey);
    const result = JSON.parse(buffer.toString()) as DeliveryAllocation;
    return result;
  }

  @Transaction(false)
  @Returns('Delivery[]')
  public async listDeliveries(
    ctx: Context,
    request: string,
  ): Promise<Delivery[]> {
    const { pageSize = 100, bookmark } = JSON.parse(request);
    const resultSet =
      await ctx.stub.getStateByPartialCompositeKeyWithPagination(
        DELIVERY,
        [],
        pageSize,
        bookmark,
      );
    return await processResultset(resultSet.iterator);
  }

  @Transaction(false)
  @Returns('KeyHistory[]')
  public async getDeliveryHistory(
    ctx: Context,
    DeliveryId: string,
  ): Promise<KeyHistory<Delivery>[]> {
    const deliveryKey = ctx.stub.createCompositeKey(DELIVERY, [DeliveryId]);
    return getKeyHistory(ctx, deliveryKey);
  }

  private async getDeliveryAllocationsByDeliveryId(
    ctx: Context,
    DeliveryId: string,
  ): Promise<DeliveryAllocation[]> {
    const resultSet = await ctx.stub.getStateByPartialCompositeKey(ALLOCATION, [
      DeliveryId,
    ]);
    return await processResultset(resultSet);
  }
}
