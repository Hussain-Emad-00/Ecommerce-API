import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateWishlistProductDto } from './dto/create-wishlist-product.dto';
import { DeleteWishlistProductDto } from './dto/delete-wishlist-product.dto';

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

  async add({ productId }: CreateWishlistProductDto, userId: number) {
    try {
      await this.prisma.wishlist.update({
        where: { userId },
        data: { productsOnWishlist: { create: { productId } } },
      });
    } catch (error) {
      throw new NotFoundException(`This product does not exist`);
    }
  }

  async remove({ productId }: DeleteWishlistProductDto, userId: number) {
    try {
      await this.prisma.wishlist.update({
        where: { userId },
        data: { productsOnWishlist: { deleteMany: { productId } } },
      });
    } catch (error) {
      throw new NotFoundException(`This product does not exist`);
    }
  }
}
