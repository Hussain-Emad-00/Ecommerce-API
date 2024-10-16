import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from '@fastify/helmet';
import compression from '@fastify/compress';
import { join } from 'path';
import fastifyCookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { cors: true },
  );

  const configService = app.get<ConfigService>(ConfigService);

  await app.register(helmet);
  await app.register(compression);
  await app.register(fastifyCookie, {
    secret: configService.get<string>('cookieSecret'),
  });
  await app.register(multipart);

  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });

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
  await app.listen(port, '0.0.0.0');
  console.log(`Server is running on port ${port}`);
}

bootstrap();
