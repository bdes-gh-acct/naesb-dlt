import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ILedgerQueryResult,
  IDelivery,
  IChannelFacility,
} from '@naesb/dlt-model';
import { IRawQueryResult } from '../util/types';
import { LedgerService } from '../ledger/ledger.service';
import { env } from '../env';
import { RegistryService } from '../registry/registry.service';

const { NAESB_CONTRACT_LABEL } = env;

@Injectable()
export class FacilityService {
  constructor(
    private readonly ledgerService: LedgerService,
    private registryService: RegistryService,
  ) {}

  getFacility(facilityId: string, channel: string, userId: string) {
    return this.ledgerService.evaluateTransaction<IDelivery>({
      userId,
      channel,
      args: [facilityId],
      contract: 'FacilityContract',
      transactionName: 'getFacility',
      namespace: NAESB_CONTRACT_LABEL,
    });
  }

  async listFacilities(
    channel: string,
    userId: string,
  ): Promise<ILedgerQueryResult<IChannelFacility>> {
    const result =
      await this.ledgerService.evaluateTransaction<IRawQueryResult>({
        userId,
        channel,
        args: [JSON.stringify({})],
        contract: 'FacilityContract',
        transactionName: 'listFacilities',
        namespace: NAESB_CONTRACT_LABEL,
      });
    return {
      ...result,
      data: JSON.parse(result.data),
    };
  }

  async createFacility(
    request: IChannelFacility,
    channel: string,
    userId: string,
  ) {
    try {
      const result = await this.ledgerService.submitTransaction({
        userId,
        channel,
        args: [JSON.stringify(request)],
        contract: 'FacilityContract',
        transactionName: 'createFacility',
        namespace: NAESB_CONTRACT_LABEL,
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
