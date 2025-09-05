import { HttpException, Injectable } from '@nestjs/common';
import { IQueryResult, QueryFactoryParams, IField } from '@naesb/dlt-model';
import { AxiosError } from 'axios';
import { RegistryService } from '../registry/registry.service';

@Injectable()
export class FieldService {
  constructor(private registryService: RegistryService) {}

  async findMany(token: string, options?: QueryFactoryParams<IField>) {
    return this.registryService.post<IQueryResult<IField>>(
      '/Fields/Search',
      options,
      token,
    );
  }

  async findOne(token: string, id: string) {
    return this.registryService.get<IField>(`/Fields/${id}`, token);
  }

  async create(token: string, well: IField) {
    try {
      const result = await this.registryService.post<IQueryResult<IField>>(
        `/Fields`,
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
