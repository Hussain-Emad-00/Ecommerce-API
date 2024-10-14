import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';

import { ReviewService } from './review.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ApiNoContentResponse } from '@nestjs/swagger';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get(':productId')
  async findAll(@Param('productId', ParseIntPipe) productId: number) {
    return await this.reviewService.findAll(productId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Req() req: FastifyRequest,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return await this.reviewService.create(createReviewDto, req['user'].id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Req() req: FastifyRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return await this.reviewService.update(id, updateReviewDto, req['user'].id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiNoContentResponse()
  async remove(
    @Req() req: FastifyRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.reviewService.remove(id, req['user'].id);
  }
}
