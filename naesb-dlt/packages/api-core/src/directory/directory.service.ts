/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@nestjs/common';
import { IQueryResult, IRegistryOrganization } from '@naesb/dlt-model';
import { RegistryService } from '../registry/registry.service';

@Injectable()
export class DirectoryService {
  ready = false;

  constructor(private registryService: RegistryService) {}

  async getOrganizations(
    token: string,
  ): Promise<{ data: Array<IRegistryOrganization>; totalRecords: number }> {
    return this.registryService.post<IQueryResult<IRegistryOrganization>>(
      '/organizations/search',
      {},
      token,
    );
  }

  async getOrganization(
    token: string,
    organizationId: string,
  ): Promise<IRegistryOrganization> {
    return this.registryService.get<IRegistryOrganization>(
      `/organizations/${organizationId}`,
      token,
    );
  }
}
