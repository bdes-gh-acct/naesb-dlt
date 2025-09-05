import { Body, Controller, Get, Post } from '@nestjs/common';
import { CredentialDefinitionService } from './credentialDefinition.service';
import * as dotenv from 'dotenv';
import { CreateCredentialDefinitionRequest } from '@naesb/aries-types';

dotenv.config();

@Controller('CredentialDefinitions')
export class CredentialDefinitionController {
  constructor(
    private readonly credentialDefinitionService: CredentialDefinitionService,
  ) {}

  @Get('/')
  public async getCredentialDefinitions() {
    return this.credentialDefinitionService.getCreatedCredentialDefinitions();
  }

  @Post('/')
  public async createCredentialDefinition(
    @Body() body: CreateCredentialDefinitionRequest,
  ) {
    return this.credentialDefinitionService.create(body);
  }
}
