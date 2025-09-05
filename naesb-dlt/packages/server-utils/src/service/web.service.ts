import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class WebService {
  constructor(private httpService: HttpService) {}

  async get<T>(service: string, url: string, token?: string): Promise<T> {
    const result = await lastValueFrom(
      await this.httpService.get<T>(`${service}${url}`, {
        headers: token
          ? {
              'Content-Type': 'application/json',
              authorization: token,
            }
          : { 'Content-Type': 'application/json' },
      }),
    );
    return result.data;
  }

  async post<T>(
    service: string,
    url: string,
    data: any = {},
    token: string,
  ): Promise<T> {
    const result = await lastValueFrom(
      await this.httpService.post<T>(`${service}${url}`, data, {
        headers: token
          ? {
              'Content-Type': 'application/json',
              authorization: token,
            }
          : { 'Content-Type': 'application/json' },
      }),
    );
    return result.data;
  }
}
