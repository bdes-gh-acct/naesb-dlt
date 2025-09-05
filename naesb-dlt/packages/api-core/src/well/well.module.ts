import { Module } from '@nestjs/common';
import { HttpModule } from '@shared/server-utils';
import { FieldModule } from '../field';
import { WellController } from './well.controller';
import { WellService } from './well.service';
import { RegistryModule } from '../registry/registry.module';

@Module({
  imports: [
    RegistryModule,
    FieldModule,
    HttpModule.register({
      retries: 5,
      retryCondition: (error) =>
        ![400, 404, 401].includes(error.response?.status || 0),
    }),
  ],
  providers: [WellService],
  exports: [WellService],
  controllers: [WellController],
})
export class WellModule {}
