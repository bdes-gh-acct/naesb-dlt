/* eslint-disable @typescript-eslint/no-inferrable-types */
import {
  Context,
  Contract,
  Info,
  Returns,
  Transaction,
} from 'fabric-contract-api';
import { Iterators } from 'fabric-shim-api';
import { ChangeTypeStatusCode, SpotPricePublication } from './model';
import { getKeyHistory, validate } from './util';
import {
  BASE_CONTRACT,
  Base,
  NaturalGasCommodityDetails,
} from './BaseContract';
import {
  createBaseContractSchema,
  reviseBaseContractSchema,
} from './BaseContractSchema';
import { KeyHistory } from './History';

@Info({ title: 'BaseContract', description: 'NAESB Base Contract' })
export class BaseContract extends Contract {
  constructor() {
    super('BaseContract');
  }

  private nonAdminCommands = [
    'init',
    'BaseContract:acceptContract',
    'BaseContract:exists',
    'BaseContract:initiateContract',
    'BaseContract:getContract',
    'BaseContract:reviseContract',
    'BaseContract:listContracts',
    'BaseContract:voidContract',
    'BaseContract:getContractHistory',
  ];

  private adminCommands = [
    'init',
    'BaseContract:exists',
    'BaseContract:getContract',
    'BaseContract:listContracts',
    'BaseContract:getContractHistory',
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
  public async exists(ctx: Context, commodity: string): Promise<boolean> {
    const buffer = await ctx.stub.getState(
      ctx.stub.createCompositeKey(BASE_CONTRACT, [commodity]),
    );
    return !!buffer && buffer.length > 0;
  }

  @Transaction()
  @Returns('Base')
  public async initiateContract(ctx: Context, input: string): Promise<Base> {
    const inputJSON = JSON.parse(input) as any;
    const schema = createBaseContractSchema(ctx);
    const validatedResult = (await validate(schema, inputJSON)) as Base;
    const { Commodity, CommodityDetail } = validatedResult;
    const base = new Base();
    const currentMSPID = ctx.clientIdentity.getMSPID();
    base.InitiatingParty = currentMSPID;
    base.ReceivingParty = validatedResult.ReceivingParty;
    base.Commodity = Commodity;
    base.Status = ChangeTypeStatusCode.INITIATE;
    const commodityDetails = new NaturalGasCommodityDetails();
    commodityDetails.CertifiedGas = CommodityDetail.CertifiedGas;
    commodityDetails.AutoAllocation = CommodityDetail.AutoAllocation;
    commodityDetails.AutoAllocationPrioritizeDaily =
      CommodityDetail.AutoAllocation
        ? CommodityDetail.AutoAllocationPrioritizeDaily
        : false;
    commodityDetails.ConfirmDeadlineDays = CommodityDetail.ConfirmDeadlineDays;
    commodityDetails.PerformanceObligationType =
      CommodityDetail.PerformanceObligationType;
    commodityDetails.SpotPricePublication =
      CommodityDetail.SpotPricePublication;
    commodityDetails.TaxesDueBy = CommodityDetail.TaxesDueBy;
    commodityDetails.PaymentDateType = CommodityDetail.PaymentDateType;
    commodityDetails.PaymentDate = CommodityDetail.PaymentDate;
    commodityDetails.PaymentType = CommodityDetail.PaymentType;
    commodityDetails.Netting = CommodityDetail.Netting;
    commodityDetails.EarlyTerminationDamages =
      CommodityDetail.EarlyTerminationDamages;
    commodityDetails.Confidentiality = CommodityDetail.Confidentiality;
    if (CommodityDetail.SpotPricePublication === SpotPricePublication.OTHER) {
      commodityDetails.OtherSpotPricePublication =
        CommodityDetail.OtherSpotPricePublication;
    }
    base.CommodityDetail = commodityDetails;
    base.Reviewing = base.ReceivingParty;
    await this.saveContract(base, ctx);
    return base;
  }

  @Transaction()
  @Returns('Base')
  public async reviseContract(ctx: Context, input: string): Promise<Base> {
    const inputJSON = JSON.parse(input) as any;
    const base = await this.getContract(ctx, (inputJSON as Base).Commodity);
    const schema = reviseBaseContractSchema(ctx, base);
    const validatedResult = (await validate(schema, inputJSON)) as Base;
    const { CommodityDetail } = validatedResult;
    base.Status = ChangeTypeStatusCode.REVISE;
    const commodityDetails = new NaturalGasCommodityDetails();
    commodityDetails.CertifiedGas = CommodityDetail.CertifiedGas;
    commodityDetails.AutoAllocation = CommodityDetail.AutoAllocation;
    commodityDetails.AutoAllocationPrioritizeDaily =
      CommodityDetail.AutoAllocation
        ? CommodityDetail.AutoAllocationPrioritizeDaily
        : false;
    commodityDetails.ConfirmDeadlineDays = CommodityDetail.ConfirmDeadlineDays;
    commodityDetails.PerformanceObligationType =
      CommodityDetail.PerformanceObligationType;
    commodityDetails.SpotPricePublication =
      CommodityDetail.SpotPricePublication;
    commodityDetails.TaxesDueBy = CommodityDetail.TaxesDueBy;
    commodityDetails.PaymentDateType = CommodityDetail.PaymentDateType;
    commodityDetails.PaymentDate = CommodityDetail.PaymentDate;
    commodityDetails.PaymentType = CommodityDetail.PaymentType;
    commodityDetails.Netting = CommodityDetail.Netting;
    commodityDetails.EarlyTerminationDamages =
      CommodityDetail.EarlyTerminationDamages;
    commodityDetails.Confidentiality = CommodityDetail.Confidentiality;
    if (CommodityDetail.SpotPricePublication === SpotPricePublication.OTHER) {
      commodityDetails.OtherSpotPricePublication =
        CommodityDetail.OtherSpotPricePublication;
    } else {
      commodityDetails.OtherSpotPricePublication = undefined;
    }
    base.CommodityDetail = commodityDetails;
    base.Reviewing =
      base.InitiatingParty === base.Reviewing
        ? base.ReceivingParty
        : base.ReceivingParty;
    await this.saveContract(base, ctx);
    return base;
  }

  @Transaction(false)
  @Returns('Base[]')
  public async listContracts(ctx: Context, request: string): Promise<Base[]> {
    const { pageSize = 100, bookmark } = JSON.parse(request);
    const resultSet = await ctx.stub.getStateByRangeWithPagination(
      '',
      '',
      pageSize,
      bookmark,
    );
    return await this.processResultset(resultSet.iterator);
  }

  private async processResultset(
    resultset: Iterators.StateQueryIterator,
  ): Promise<Base[]> {
    try {
      const results = [];
      while (true) {
        const obj = await resultset.next();

        if (obj.value) {
          const resultStr = Buffer.from(obj.value.value).toString('utf8');
          const resultJson = (await JSON.parse(resultStr)) as Base;
          results.push(resultJson);
        }

        if (obj.done) {
          return results;
        }
      }
    } finally {
      await resultset.close();
    }
  }

  @Transaction()
  public async acceptContract(ctx: Context, input: string): Promise<void> {
    const { Commodity } = JSON.parse(input) as any;
    const contract = await this.getContract(ctx, Commodity);
    const AcceptableStatusCodes = [
      ChangeTypeStatusCode.INITIATE,
      ChangeTypeStatusCode.DISPUTE,
      ChangeTypeStatusCode.REVISE,
    ];
    if (
      !AcceptableStatusCodes.includes(contract.Status as ChangeTypeStatusCode)
    ) {
      throw new Error(
        'The contract from commodity ' +
          Commodity +
          ` is in the wrong status.  Expected ${AcceptableStatusCodes.join(
            ', ',
          )} got ` +
          contract.Status,
      );
    }
    const currentMSPID = ctx.clientIdentity.getMSPID();
    if (contract.Reviewing !== currentMSPID) {
      throw new Error(
        `The contract can only be approved by the party currently reviewing.  Current reviewer: ${contract.Reviewing}`,
      );
    }
    contract.Status = ChangeTypeStatusCode.ACCEPT;
    contract.Reviewing = undefined;
    contract.Approved = { ...contract };
    await this.saveContract(contract, ctx);
  }

  @Transaction()
  public async voidContract(ctx: Context, DealId: string): Promise<void> {
    const contract = await this.getContract(ctx, DealId);
    contract.Status = ChangeTypeStatusCode.VOID;
    contract.Reviewing = undefined;
    contract.Approved = undefined;
    await this.saveContract(contract, ctx);
  }

  @Transaction(false)
  @Returns('Base')
  public async getContract(ctx: Context, commodity: string): Promise<Base> {
    const buffer = await ctx.stub.getState(
      ctx.stub.createCompositeKey(BASE_CONTRACT, [commodity]),
    );
    if (!!buffer && buffer.length > 0) {
      return JSON.parse(buffer.toString()) as Base;
    }
    throw new Error(`Base contract for ${commodity} does not exists`);
  }

  private async saveContract(contract: Base, ctx: Context) {
    contract.Revision = (contract.Revision || 0) + 1;
    const buffer = Buffer.from(JSON.stringify(contract));
    await ctx.stub.putState(
      ctx.stub.createCompositeKey(BASE_CONTRACT, [contract.Commodity]),
      buffer,
    );
    await ctx.stub.setEvent('BaseContractEvent', buffer);
  }

  @Transaction(false)
  @Returns('Base[]')
  public async getContractHistory(
    ctx: Context,
    commodity: string,
  ): Promise<KeyHistory<Base>[]> {
    return getKeyHistory(
      ctx,
      ctx.stub.createCompositeKey(BASE_CONTRACT, [commodity]),
    );
  }
}
