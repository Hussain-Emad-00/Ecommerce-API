import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateProductReviewDto } from './dto/create-product-review.dto';
import { UpdateProductReviewDto } from './dto/update-product-review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async findAll(productId: number) {
    try {
      return await this.prisma.productReviews.findMany({
        where: { productId },
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async create(createReviewDto: CreateProductReviewDto, userId: number) {
    try {
      return await this.prisma.productReviews.create({
        data: { ...createReviewDto, userId },
      });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async update(id: number, updateReviewDto: UpdateProductReviewDto, userId: number) {
    try {
      if (updateReviewDto.like || updateReviewDto.dislike) {
        updateReviewDto.like = !updateReviewDto.dislike;
        updateReviewDto.dislike = !updateReviewDto.like;
      }
      
      return await this.prisma.productReviews.update({
        where: { id, userId },
        data: { ...updateReviewDto, userId },
      });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async remove(id: number, userId: number) {
    try {
      await this.prisma.productReviews.delete({ where: { id, userId } });
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
