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

  async findOne(where: Prisma.ProductWhereUniqueInput) {
    try {
      return await this.prisma.product.findUnique({
        where,
        include: {
          user: { select: { firstname: true, lastname: true, id: true } },
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

  async paginate(page: number, limit: number) {
    try {
      if (page <= 0) page = 1;
      if (limit < 10) limit = 10;

      const query = paginate(
        { page, limit },
        { orderBy: { createdAt: 'desc' } },
      );

      return await this.prisma.product.findMany(query);
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
    { category_name, ...createProductDto }: CreateProductDto,
    userId: number,
    file: ImageInterface,
  ) {
    const category = await this.prisma.category.findFirst({
      where: { name: category_name },
    });
    if (!category) throw new NotFoundException();

    try {
      await this.cacheManager.del('products');
      createProductDto.image = await this.upload(file, 'product');
      if (createProductDto.quantity <= 0) createProductDto.quantity = 0

      return this.prisma.product.create({
        data: { ...createProductDto, categoryId: category.id, userId },
      });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async update(
    id: number,
    {category_name, ...updateProductDto}: UpdateProductDto,
    userId: number,
    file: ImageInterface,
  ) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (updateProductDto.image) {
      updateProductDto.image = await this.upload(file, 'product');
      if (product.image.includes('cloudinary'))
        await this.imageService.remove(product.image);
    }

    if (updateProductDto.quantity <= 0) updateProductDto.quantity = 0

    try {
      await this.cacheManager.del('products');
      if (category_name) {
        const category = await this.prisma.category.findFirst({
          where: { name: category_name },
        });
        return this.prisma.product.update({
          where: { id, userId },
          data: { ...updateProductDto, categoryId: category.id },
        });
      }

      return await this.prisma.product.update({
        where: { id, userId },
        data: updateProductDto,
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
