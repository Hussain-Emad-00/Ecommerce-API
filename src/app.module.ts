import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { ReviewModule } from './review/review.module';
import { CategoryModule } from './category/category.module';
import { RolesModule } from './roles/roles.module';
import configuration from './config/configuration';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 10000, limit: 15 }]),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('accessTokenSecretKey'),
        signOptions: { expiresIn: '10d' },
      }),
      global: true,
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 60 * 10,
      max: 100,
    }),
    UserModule,
    AuthModule,
    ProductModule,
    CartModule,
    ReviewModule,
    CategoryModule,
    RolesModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
