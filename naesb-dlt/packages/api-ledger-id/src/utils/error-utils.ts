import { BadRequestException } from '@nestjs/common';
import { AxiosError } from 'axios';

export const throwError = (e: any, path: string, optMessage?: string) => {
  const error = e as AxiosError;
  console.log(`Id-Service Error: ${error.message}.
      Path ${path},
      ${optMessage ? optMessage : ''}`);
  throw new BadRequestException(error.response.data);
};
