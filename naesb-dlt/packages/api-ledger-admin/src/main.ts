import { NestFactory } from '@nestjs/core';
import { httpLoggerMiddleware, logger } from '@shared/server-utils';
import * as cors from 'cors';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/admin/v1');
  app.use(httpLoggerMiddleware);
  app.use(cors());
  logger.info(`Application starting on ${process.env.HOST_PORT || 5000}`);
  await app.listen(Number(process.env.HOST_PORT || 5000));
}
bootstrap();
