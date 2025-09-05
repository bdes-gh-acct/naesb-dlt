import { Module } from '@nestjs/common';
import { HttpModule } from '@shared/server-utils';
import { FieldController } from './field.controller';
import { FieldService } from './field.service';
import { RegistryModule } from '../registry/registry.module';

@Module({
  imports: [
    RegistryModule,
    HttpModule.register({
      retries: 5,
      retryCondition: (error) =>
        ![400, 404, 401].includes(error.response?.status || 0),
    }),
  ],
  providers: [FieldService],
  exports: [FieldService],
  controllers: [FieldController],
})
export class FieldModule {}
