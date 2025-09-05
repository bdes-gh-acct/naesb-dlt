import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { Public } from 'src/auth.guard';
import { CreateCertDto } from './createCert.dto';
import { CreateCertRequest, GetUserRequest, MspService } from './msp.service';
import { AxiosError } from 'axios';

@Controller('msp')
export class MspController {
  constructor(private readonly mspService: MspService) {}

  @Public()
  @Get('root')
  getRoot() {
    return this.mspService.getRoot();
  }

  @Public()
  @Post('certs')
  async createCert(@Body() { role, name }: CreateCertDto) {
    const response = await this.mspService.createCert({
      role,
      name,
    } as CreateCertRequest);
    return response;
  }

  @Public()
  @Get('certs/:role/:name')
  async getUser(@Param('role') role: string, @Param('name') name: string) {
    try {
      const response = await this.mspService.getUser({
        role,
        name,
      } as GetUserRequest);
      return response;
    } catch (error) {
      const err = error as AxiosError;
      console.error(err.response?.data || err.message);
      throw new NotFoundException();
    }
  }
}
