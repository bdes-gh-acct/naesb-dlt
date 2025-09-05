import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  Request,
} from '@nestjs/common';
import { IOrganization } from '@shared/model';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { Organization } from 'src/db';
import { ApiQueryParams, queryFactory } from '@shared/orm';
import { AppQuery } from 'src/util/middleware';
import { OrganizationService } from './organization.service';

@ApiBearerAuth()
@ApiTags('Organizations')
@Controller('Organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post('/search')
  @AppQuery(Organization)
  public async findMany(@Body() body: ApiQueryParams<Organization>) {
    return this.organizationService.findMany(queryFactory<Organization>(body));
  }

  @Post('/')
  public async create(@Body() body: IOrganization, @Req() request: Request) {
    const result = await this.organizationService.create(body, request);

    return result;
  }

  @ApiParam({
    name: 'businessId',
    required: true,
    description: 'Unique identifier of the business',
  })
  @Get(':businessId')
  async findOne(
    @Param('businessId') businessId: string,
  ): Promise<IOrganization> {
    const result = await this.organizationService.findOne(businessId);
    if (result) {
      return result;
    }
    throw new NotFoundException();
  }

  @ApiParam({
    name: 'businessId',
    required: true,
    description: 'Unique identifier of the business',
  })
  @Post(':businessId')
  async edit(
    @Param('businessId') businessId: string,
    @Body() organization: IOrganization,
  ) {
    return this.organizationService.edit({ ...organization, businessId });
  }

  @ApiParam({
    name: 'businessId',
    required: true,
    description: 'Unique identifier of the business',
  })
  @Post(':businessId/did')
  async editDid(
    @Param('businessId') businessId: string,
    @Body() organization: IOrganization,
  ) {
    return this.organizationService.editDid({ ...organization, businessId });
  }
}
