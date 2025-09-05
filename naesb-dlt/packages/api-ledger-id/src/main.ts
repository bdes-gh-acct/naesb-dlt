import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/ca/v1');
  await app.listen(Number(process.env.HOST_PORT || 8080));
}
bootstrap();
