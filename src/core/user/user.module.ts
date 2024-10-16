import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../../prisma.service';
import { ImageModule } from '../../images/image.module';
import { MailService } from '../../mail.service';

@Module({
  imports: [ImageModule],
  controllers: [UserController],
  providers: [PrismaService, MailService, UserService],
  exports: [UserService],
})
export class UserModule {}
