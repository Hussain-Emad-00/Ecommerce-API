import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async find(userId: number) {
    try {
      return await this.prisma.wishlist.findFirst({
        where: { userId },
        include: { productsOnWishlist: { include: { product: true } } },
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async add({ productId }: CreateWishlistDto, userId: number) {
    try {
      await this.prisma.wishlist.update({
        where: { userId },
        data: { productsOnWishlist: { create: { productId } } },
      });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async remove(productId: number, userId: number) {
    try {
      await this.prisma.wishlist.update({
        where: { userId },
        data: { productsOnWishlist: { deleteMany: { productId } } },
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
