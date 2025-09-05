import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cors from 'cors';
import { AppModule } from './app.module';
import { httpLoggerMiddleware, logger } from './util/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/core/v1');
  const config = new DocumentBuilder()
    .setTitle('NAESB Core API')
    .setDescription('Core functionality for the NAESB smart trading platform')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/core/v1/docs', app, document);
  app.use(httpLoggerMiddleware);
  app.use(cors());
  logger.info(`Application starting on ${process.env.HOST_PORT || 5000}`);
  await app.listen(Number(process.env.HOST_PORT || 5000));
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
