/* eslint-disable @typescript-eslint/no-inferrable-types */
import {
  Context,
  Contract,
  Info,
  Returns,
  Transaction,
} from 'fabric-contract-api';
import { getKeyHistory, processResultset, validate } from './util';
import { createBaseContractSchema } from './BaseContractSchema';
import { FACILITY, Facility } from './Facility';
import { KeyHistory } from './History';
import {
  bulkCreateFacilitySchema,
  createFacilitySchema,
} from './FacilitySchema';

@Info({ title: 'FacilityContract', description: 'NAESB Facility Contract' })
export class FacilityContract extends Contract {
  constructor() {
    super('BaseContract');
  }

  private nonAdminCommands = [
    'init',
    'BaseContract:exists',
    'FacilityContract:createFacility',
    'FacilityContract:createCertificate',
    'FacilityContract:getFacility',
    'FacilityContract:getCertificate',
    'FacilityContract:listFacilities',
    'FacilityContract:listCertificates',
  ];

  private adminCommands = [
    'init',
    'BaseContract:exists',
    'FacilityContract:getFacility',
    'FacilityContract:getCertificate',
    'FacilityContract:listFacilities',
    'FacilityContract:listCertificates',
  ];

  private getAuthorization(tx: string, ctx: Context) {
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

  public async beforeTransaction(ctx: Context) {
    const tx = ctx.stub.getFunctionAndParameters().fcn;
    this.getAuthorization(tx, ctx);
  }

  /**
   * Perform any setup of the ledger that might be required
   * @param {Context} ctx the transaction context
   */
  @Transaction()
  public async init() {
    console.log('Upgrading the contract');
  }

  /**
   * Validate if the tradeId already exists on the ledger
   * @param {Context} ctx the transaction context
   * @param {string} tradeId the unique trade identifier
   */
  @Transaction(false)
  @Returns('boolean')
  public async facilityExists(
    ctx: Context,
    facilityId: string,
  ): Promise<boolean> {
    const buffer = await ctx.stub.getState(
      ctx.stub.createCompositeKey(FACILITY, [facilityId]),
    );
    return !!buffer && buffer.length > 0;
  }

  @Transaction()
  @Returns('Base')
  public async createFacility(ctx: Context, input: string): Promise<Facility> {
    const inputJSON = JSON.parse(input) as any;
    const schema = createFacilitySchema(ctx);
    const validatedResult = (await validate(schema, inputJSON)) as Facility;
    const base = new Facility();
    const currentMSPID = ctx.clientIdentity.getMSPID();
    base.Owner = currentMSPID;
    base.FacilityId = validatedResult.FacilityId;
    base.Name = validatedResult.Name;
    base.Type = validatedResult.Type;
    base.Type = validatedResult.Type;
    base.ReceiptLocationId = validatedResult.ReceiptLocationId;
    await this.saveFacility(base, ctx);
    return base;
  }

  @Transaction()
  @Returns('Base')
  public async bulkCreateFacility(
    ctx: Context,
    input: string,
  ): Promise<Array<Facility>> {
    const inputJSON = JSON.parse(input) as any;
    const schema = bulkCreateFacilitySchema(ctx);
    const validatedResult = (await validate(
      schema,
      inputJSON,
    )) as Array<Facility>;
    const result: Array<Facility> = [];
    for (const facility of validatedResult) {
      const base = new Facility();
      const currentMSPID = ctx.clientIdentity.getMSPID();
      base.Owner = currentMSPID;
      base.FacilityId = facility.FacilityId;
      base.Name = facility.Name;
      base.Type = facility.Type;
      base.Type = facility.Type;
      base.ReceiptLocationId = facility.ReceiptLocationId;
      await this.saveFacility(base, ctx);
      result.push(base);
    }

    await ctx.stub.setEvent(
      'FacilityEvent',
      Buffer.from(JSON.stringify(result)),
    );
    return result;
  }

  @Transaction(false)
  @Returns('Facility[]')
  public async listFacilities(
    ctx: Context,
    request: string,
  ): Promise<Facility[]> {
    const { pageSize = 100, bookmark } = JSON.parse(request);
    const resultSet = await ctx.stub.getStateByRangeWithPagination(
      '',
      '',
      pageSize,
      bookmark,
    );
    return await processResultset(resultSet.iterator);
  }

  @Transaction(false)
  @Returns('Base')
  public async getFacility(
    ctx: Context,
    facilityId: string,
  ): Promise<Facility> {
    const buffer = await ctx.stub.getState(
      ctx.stub.createCompositeKey(FACILITY, [facilityId]),
    );
    if (!!buffer && buffer.length > 0) {
      return JSON.parse(buffer.toString()) as Facility;
    }
    throw new Error(`Facility ${facilityId} does not exists`);
  }

  private async saveFacility(facility: Facility, ctx: Context) {
    const buffer = Buffer.from(JSON.stringify(facility));
    await ctx.stub.putState(
      ctx.stub.createCompositeKey(FACILITY, [facility.FacilityId]),
      buffer,
    );
    await ctx.stub.setEvent('FacilityEvent', buffer);
  }

  @Transaction(false)
  @Returns('Facility[]')
  public async getFacilityHistory(
    ctx: Context,
    commodity: string,
  ): Promise<KeyHistory<Facility>[]> {
    const key = ctx.stub.createCompositeKey(FACILITY, [commodity]);
    return getKeyHistory(ctx, key);
  }
}
