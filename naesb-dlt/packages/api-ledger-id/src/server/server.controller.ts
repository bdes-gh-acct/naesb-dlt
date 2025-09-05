import { Body, Controller, Get, Post } from '@nestjs/common';
import { vaultLoginReqDto } from 'src/user/dtos/vault.dto';
import { ServerService } from './server.service';

@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Post('initServerCreds')
  initServerCredentials(@Body() loginDto: vaultLoginReqDto) {
    return this.serverService.generateServerCreds(loginDto);
  }

  @Get('getTlsCert')
  getTlsCert() {
    return this.serverService.getTlsCert();
  }
}
