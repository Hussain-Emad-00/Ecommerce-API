import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { paginate } from 'nestjs-prisma-pagination';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';
import { ImageInterface } from '../interfaces/image.interface';
import { ImageService } from '../images/image.service';
import { Role } from '../decorators/roles.decorator';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private imageService: ImageService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    try {
      return await this.prisma.product.findMany();
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async find(page: number, limit: number) {
    try {
      if (page <= 0 || typeof page !== 'number') page = 1;
      if (limit <= 0 || typeof limit !== 'number') limit = 10;

      const query = paginate(
        { page, limit },
        { orderBy: { createdAt: 'desc' } },
      );

      return await this.prisma.product.findMany(query);
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async findOne(where: Prisma.ProductWhereUniqueInput) {
    try {
      return await this.prisma.product.findUnique({
        where,
        include: {
          user: { select: { firstname: true, lastname: true } },
          reviews: {
            include: {
              user: { select: { firstname: true, lastname: true, id: true } },
            },
          },
          category: { select: { name: true } },
        },
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async search(title: string) {
    if (!title || title.length < 3) return;

    try {
      return this.prisma.product.findMany({
        where: { title: { contains: title, mode: 'insensitive' } },
      });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async create(
    { category_name, ...data }: CreateProductDto,
    userId: number,
    file: ImageInterface,
  ) {
    const category = await this.prisma.category.findFirst({
      where: { name: category_name },
    });
    if (!category) throw new NotFoundException();

    try {
      data.image = await this.upload(file, 'product');

      await this.cacheManager.del('products');

      return this.prisma.product.create({
        data: { ...data, categoryId: category.id, userId },
      });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async update(
    id: number,
    { category_name, ...data }: UpdateProductDto,
    userId: number,
    file: ImageInterface,
  ) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    data.image = await this.upload(file, 'product');
    if (data.image && product.image.includes('cloudinary'))
      await this.imageService.remove(product.image);

    await this.cacheManager.del('products');
    try {
      if (category_name) {
        const category = await this.prisma.category.findFirst({
          where: { name: category_name },
        });
        return this.prisma.product.update({
          where: { id, userId },
          data: { ...data, categoryId: category.id },
        });
      }

      return await this.prisma.product.update({
        where: { id, userId },
        data,
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async remove(where: Prisma.ProductWhereUniqueInput, user: any) {
    try {
      const product = await this.prisma.product.findUnique({ where });
      if (product.userId == user.id || user.role == Role.Admin) {
        await this.prisma.product.delete({ where });
        await this.cacheManager.del('products');
      }
    } catch (error) {
      throw new NotFoundException();
    }
  }

  private async upload(file: ImageInterface, folder: string) {
    return await this.imageService.create(file, folder);
  }
}
