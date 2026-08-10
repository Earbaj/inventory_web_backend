import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('KeeperPOS-Server');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // OpenAPI Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('Keeper POS — API Documentation')
    .setDescription('Enterprise Point of Sale, Inventory Management, Customer Ledger, and Financial Analytics REST API Service powered by NestJS & MongoDB.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`=============================================================`);
  logger.log(`🚀 Keeper POS Backend Server is running on: http://localhost:${port}`);
  logger.log(`📊 Web Application Dashboard UI: http://localhost:${port}/`);
  logger.log(`📜 Interactive Swagger API Docs: http://localhost:${port}/api/docs`);
  logger.log(`=============================================================`);
}

bootstrap();
