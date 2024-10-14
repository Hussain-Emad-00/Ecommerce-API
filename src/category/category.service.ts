import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.category.findMany();
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({ data: createCategoryDto });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async update(id: number, { name }: UpdateCategoryDto) {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: { name },
      });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
