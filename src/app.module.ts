import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';

import { UserModule } from './core/user/user.module';
import { AuthModule } from './core/auth/auth.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { ReviewModule } from './review/review.module';
import { CategoryModule } from './category/category.module';
import { RolesModule } from './core/roles/roles.module';
import { PaymentModule } from './payment/payment.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 1000 * 60 * 10, limit: 50 }]), // ms * sec * min
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('accessTokenSecretKey'),
        signOptions: { expiresIn: '30m' },
      }),
      global: true,
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 60 * 10, // sec * min * hr
      max: 100,
    }),
    UserModule,
    AuthModule,
    ProductModule,
    CartModule,
    ReviewModule,
    CategoryModule,
    RolesModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
