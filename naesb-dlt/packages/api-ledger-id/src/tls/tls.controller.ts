import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from 'src/auth.guard';
import { CreateCertDto } from './createCert.dto';
import { TlsService } from './tls.service';

@Controller('tls')
export class TlsController {
  constructor(private readonly tlsService: TlsService) {}

  @Public()
  @Get('root')
  getRoot() {
    return this.tlsService.getRoot();
  }

  @Public()
  @Post('certs')
  createCert(@Body() body: CreateCertDto) {
    const response = this.tlsService.createCert(
      body.role,
      body.name,
      body.alt_names,
    );
    return response;
  }
}
