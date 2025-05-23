import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONT_URL,
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true
  })

  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  // app.useGlobalPipes(new TransformPI)
  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
