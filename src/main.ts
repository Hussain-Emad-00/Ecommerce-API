import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from '@fastify/helmet';
import compression from '@fastify/compress';
import multipart from '@fastify/multipart';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get<ConfigService>(ConfigService);
  const env = configService.get<string>('NODE_ENV');
  const frontendUrl = configService.get<string>('frontendUrl');
  
  app.enableCors({ origin: env == 'development' ? '*' : frontendUrl });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(compression);
  await app.register(multipart);

  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onRequest', (request, reply, done) => {
      reply['setHeader'] = function (key: any, value: any) {
        return this.raw.setHeader(key, value);
      };
      reply['end'] = function () {
        this.raw.end();
      };
      request['res'] = reply;
      done();
    });

  const SwaggerConfig = new DocumentBuilder()
    .setTitle('Ecommerce')
    .setDescription('The Ecommerce API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, SwaggerConfig);
  SwaggerModule.setup('', app, document);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = configService.get<string>('appPort');
  await app.listen(port, '0.0.0.0', (err, address) => {
    console.log(`Server is running on ${address}`);
  });
}

bootstrap();
