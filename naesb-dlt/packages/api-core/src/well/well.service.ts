import { HttpException, Injectable } from '@nestjs/common';
import { IQueryResult, QueryFactoryParams, IWell } from '@naesb/dlt-model';
import { AxiosError } from 'axios';
import { RegistryService } from '../registry/registry.service';

@Injectable()
export class WellService {
  constructor(private registryService: RegistryService) {}

  async findMany(token: string, options?: QueryFactoryParams<IWell>) {
    return this.registryService.post<IQueryResult<IWell>>(
      '/Wells/Search',
      options,
      token,
    );
  }

  async findOne(token: string, id: string) {
    return this.registryService.get<IWell>(`/Wells/${id}`, token);
  }

  async create(token: string, well: IWell) {
    try {
      const result = await this.registryService.post<IQueryResult<IWell>>(
        `/Wells`,
        well,
        token,
      );
      return result;
    } catch (e) {
      const error = e as AxiosError;
      throw new HttpException(
        (error.response?.data as Record<string, any>) || error.message,
        error.response?.status || 500,
      );
    }
  }
}
