import { Module } from '@nestjs/common';

import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaService } from '../prisma.service';
import { ImageModule } from '../images/image.module';

@Module({
  imports: [ImageModule],
  controllers: [ProductController],
  providers: [ProductService, PrismaService],
})
export class ProductModule {}
