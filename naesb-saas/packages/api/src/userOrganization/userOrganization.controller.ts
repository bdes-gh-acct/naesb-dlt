import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { QueryResult, IUserOrganization } from '@shared/model';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserOrganizationService } from './userOrganization.service';
import { Public } from 'src/auth';

@ApiBearerAuth()
@ApiTags('User Organizations')
@Controller('UserOrganizations')
export class UserOrganizationController {
  constructor(
    private readonly userOrganizationService: UserOrganizationService,
  ) {}

  @Post('search')
  public async search(): Promise<QueryResult<IUserOrganization>> {
    return this.userOrganizationService.findMany();
  }

  @Post('/')
  public async create(@Body() body: IUserOrganization) {
    return this.userOrganizationService.create(body);
  }

  @ApiParam({
    name: 'businessId',
    required: true,
    description: 'Unique identifier of the business',
  })
  @Get('business/:businessId')
  async findAllByBusinessID(
    @Param('businessId') businessId: string,
    @Req() request: Request,
  ): Promise<QueryResult<IUserOrganization>> {
    const result = await this.userOrganizationService.findMany({
      where: {
        businessId,
      },
    });

    if (
      !result.data.find((business) => business.userId === request.user?.sub)
    ) {
      throw new UnauthorizedException();
    }
    return result;
  }

  @Get('user')
  async findAllByUserID(
    @Req() request: Request,
  ): Promise<QueryResult<IUserOrganization>> {
    const userId = request.user?.sub as string;
    const result = await this.userOrganizationService.findMany({
      where: {
        userId,
      },
      relations: {
        organization: true,
      },
    });
    return result;
  }

  @ApiParam({
    name: 'businessId',
    required: true,
    description: 'Unique identifier of the business',
  })
  @Get(':businessId/:userId')
  async delete(
    @Param('businessId') businessId: string,
    @Param('userId') userId: string,
  ) {
    return this.userOrganizationService.delete({ businessId, userId });
  }
}
