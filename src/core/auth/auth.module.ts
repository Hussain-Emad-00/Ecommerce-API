import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { LocalStrategy } from '../../common/strategies/local.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../../prisma.service';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { GoogleStrategy } from '../../common/strategies/google.strategy';
import { MailService } from '../../mail.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PassportModule, UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    MailService,
  ],
})
export class AuthModule {}
