/* eslint-disable @typescript-eslint/no-floating-promises */
// @ts-nocheck
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv.config();

const { HOST_PORT = 3000 } = process.env;
// eslint-disable-next-line @typescript-eslint/require-await

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

  await app.listen(Number(HOST_PORT));
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
