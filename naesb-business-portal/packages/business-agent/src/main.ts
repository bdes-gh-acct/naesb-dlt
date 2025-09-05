/* eslint-disable @typescript-eslint/no-floating-promises */
// @ts-nocheck
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

dotenv.config();

const {
  HOST_PORT = 3000,
  KAFKA_CLIENT_ID,
  BOOTSTRAP_BROKERS,
  KAFKA_GROUP_ID,
} = process.env;

// eslint-disable-next-line @typescript-eslint/require-await

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: KAFKA_CLIENT_ID,
        brokers: BOOTSTRAP_BROKERS?.split(',') || [],
      },
      consumer: {
        groupId: KAFKA_GROUP_ID,
      },
    },
  });
  app.setGlobalPrefix('api/agent/v1');
  const config = new DocumentBuilder()
    .setTitle('Agent API')
    .setDescription('REST API for issuing CertGas credentials')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/agent/v1/docs', app, document);
  app.enableCors();
  await app.startAllMicroservices();
  await app.listen(Number(HOST_PORT));
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
