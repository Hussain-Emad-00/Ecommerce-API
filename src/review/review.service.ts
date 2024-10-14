import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from '../prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

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

  async create(createReviewDto: CreateReviewDto, userId: number) {
    try {
      return await this.prisma.productReviews.create({
        data: { ...createReviewDto, userId },
      });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async update(id: number, updateReviewDto: UpdateReviewDto, userId: number) {
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
