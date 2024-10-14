import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateCartDto } from './dto/create-cart.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async find(userId: number) {
    try {
      return await this.prisma.cart.findFirst({
        where: { userId },
        include: { productsOnCart: { include: { product: true } } },
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async add({ productId }: CreateCartDto, userId: number) {
    try {
      await this.prisma.cart.update({
        where: { userId },
        data: { productsOnCart: { create: { productId } } },
      });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async remove(productId: number, userId: number) {
    try {
      await this.prisma.cart.update({
        where: { userId },
        data: { productsOnCart: { deleteMany: { productId } } },
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
