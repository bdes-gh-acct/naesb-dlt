import { Body, Controller, Post } from '@nestjs/common';
import { CredentialService } from './credential.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Controller('Credentials')
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @Post('/')
  public async issueCredential(@Body() body: any) {
    return this.credentialService.issue(body);
  }

  @Post('/search')
  public async getCredentials() {
    return this.credentialService.getCredentials();
  }

  @Post('/issued/search')
  public async getCredentialRecords() {
    return this.credentialService.getCredentialExchangeRecords();
  }
}
