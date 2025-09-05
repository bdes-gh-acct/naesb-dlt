import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const { HOST_PORT = 3000, ENABLE_CORS } = process.env;
declare module '@nestjs/common' {
  interface Request {
    user?: { sub: string };
  }
}
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/saas/v1');
  app.use(cookieParser());
  if (ENABLE_CORS) {
    app.enableCors();
  }
  const config = new DocumentBuilder()
    .setTitle('SaaS API')
    .setDescription('REST API for Registering Businesses')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/saas/v1/docs', app, document);
  await app.listen(Number(HOST_PORT));
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
