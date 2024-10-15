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
import { CreateCartProductDto } from './dto/create-cart-product.dto';
import { DeleteCartProductDto } from './dto/delete-cart-product.dto';

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
  async add(@Req() req: FastifyRequest, @Body() createCartDto: CreateCartProductDto) {
    return await this.cartService.add(createCartDto, req['user'].id);
  }

  @Delete()
  @ApiNoContentResponse()
  async remove(
    @Req() req: FastifyRequest,
    @Body() deleteCartDto: DeleteCartProductDto,
  ) {
    return await this.cartService.remove(deleteCartDto, req['user'].id);
  }
}
