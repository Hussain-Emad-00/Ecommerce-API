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

import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async find(@Req() req: FastifyRequest) {
    return await this.cartService.find(req['user'].id);
  }

  @Post()
  @ApiCreatedResponse()
  async add(@Req() req: FastifyRequest, @Body() createCartDto: CreateCartDto) {
    return await this.cartService.add(createCartDto, req['user'].id);
  }

  @Delete()
  @ApiQuery({ name: 'productId' })
  @ApiNoContentResponse()
  async remove(
    @Req() req: FastifyRequest,
    @Query('productId', ParseIntPipe) productId: number,
  ) {
    return await this.cartService.remove(productId, req['user'].id);
  }
}
