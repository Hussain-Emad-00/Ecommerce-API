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
import { CreateWishlistProductDto } from './dto/create-wishlist-product.dto';
import { DeleteWishlistProductDto } from './dto/delete-wishlist-product.dto';

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
    @Body() createCartDto: CreateWishlistProductDto,
  ) {
    return await this.wishlistService.add(createCartDto, req['user'].id);
  }

  @Delete()

  @ApiNoContentResponse()
  async remove(
    @Req() req: FastifyRequest,
    @Body() deleteCartDto: DeleteWishlistProductDto,
  ) {
    return await this.wishlistService.remove(deleteCartDto, req['user'].id);
  }
}
