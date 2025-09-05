import { Module } from '@nestjs/common';
import { HttpModule } from '@shared/server-utils';
import { VaultService } from './vault.service';

@Module({
  imports: [
    HttpModule.register({
      retries: 5,
      retryCondition: (error) => ![404, 401].includes(error.response?.status),
      onRetry: (count, error) => {
        console.error(
          `Try ${count} failed with status: ${
            error.response?.status || error.message
          }`,
        );
      },
    }),
  ],
  providers: [VaultService],
  exports: [VaultService],
})
export class VaultModule {}
