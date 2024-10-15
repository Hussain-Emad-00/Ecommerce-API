import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateCartProductDto } from './dto/create-cart-product.dto';
import { DeleteCartProductDto } from './dto/delete-cart-product.dto';

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

  async add({ productId }: CreateCartProductDto, userId: number) {
    try {
      await this.prisma.cart.update({
        where: { userId },
        data: { productsOnCart: { create: { productId } } },
      });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async remove({productId}: DeleteCartProductDto, userId: number) {
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
