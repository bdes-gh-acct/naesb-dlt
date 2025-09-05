import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cors from 'cors';
// eslint-disable-next-line import/no-extraneous-dependencies
import { urlencoded, json } from 'express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { httpLoggerMiddleware } from './util/logger';
import { env } from './env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: env.KAFKA_CLIENT_ID,
        brokers: env.BOOTSTRAP_BROKERS?.split(',') || [],
      },
      consumer: {
        groupId: env.KAFKA_GROUP_ID,
      },
    },
  });
  app.setGlobalPrefix('api/ledger/v1');
  const config = new DocumentBuilder()
    .setTitle('NAESB Ledger API')
    .setDescription('Ledger functionality for the NAESB smart trading platform')
    .setVersion('1.0')
    .build();
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/ledger/v1/docs', app, document);
  app.use(httpLoggerMiddleware);
  app.use(cors());
  await app.startAllMicroservices();
  await app.listen(Number(env.HOST_PORT || 5000));
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
