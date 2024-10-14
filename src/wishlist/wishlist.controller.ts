import {
  Body,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';

import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';

@Controller('wishlist')
@UseGuards(AuthGuard('jwt'))
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async find(@Req() req: FastifyRequest) {
    return await this.wishlistService.find(req['user'].id);
  }

  @Post()
  @ApiCreatedResponse()
  async add(
    @Req() req: FastifyRequest,
    @Body() createCartDto: CreateWishlistDto,
  ) {
    return await this.wishlistService.add(createCartDto, req['user'].id);
  }

  @Delete()
  @ApiQuery({ name: 'productId' })
  @ApiNoContentResponse()
  async remove(
    @Req() req: FastifyRequest,
    @Query('productId', ParseIntPipe) productId: number,
  ) {
    return await this.wishlistService.remove(productId, req['user'].id);
  }
}
