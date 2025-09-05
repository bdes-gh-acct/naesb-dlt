import { Controller, Post } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Controller('Certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post('/search')
  public async getCertificates() {
    return this.certificateService.getCertificates();
  }

  @Post('/issued/search')
  public async getIssuedCertificates() {
    return this.certificateService.getIssuedCertificates();
  }
}
