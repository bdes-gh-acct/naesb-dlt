import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@shared/server-utils';
import { CaService } from '../ca/ca.service';
// eslint-disable-next-line import/no-extraneous-dependencies
const { ORG_ID, ORG_MSP_ID, ORG_NAME } = process.env;

@ApiTags('Profile')
@Controller('.well-known')
export class WellKnownController {
  constructor(private caService: CaService) {}

  @Public()
  @Get('nodeinfo')
  async get() {
    const [mspCa, tlsCa] = await Promise.all([
      this.caService.getMspCa(),
      this.caService.getTlsCa(),
    ]);
    return {
      businessId: ORG_ID,
      name: ORG_NAME,
      mspId: ORG_MSP_ID,
      mspCa,
      tlsCa,
    };
  }
}
