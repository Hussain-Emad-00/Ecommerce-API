import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiNoContentResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import {
  FileInterceptor,
  MemoryStorageFile,
  UploadedFile,
} from '@blazity/nest-file-fastify';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';

import { ProductService } from './product.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginateProductsDto } from './dto/paginate-products.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('products')
  async findAll() {
    return await this.productService.findAll();
  }

  @Get('paginate')
  async find(@Query() query: PaginateProductsDto) {
    return await this.productService.find(query.page, query.limit);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.findOne({ id });
  }

  @Get('search')
  @ApiQuery({ name: 'title', required: true })
  async search(@Query('title') title: string) {
    return this.productService.search(title);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image', {}))
  @ApiConsumes('multipart/form-data')
  async create(
    @Req() req: FastifyRequest,
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: MemoryStorageFile,
  ) {
    return await this.productService.create(
      createProductDto,
      req['user'].id,
      file,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image', {}))
  @ApiConsumes('multipart/form-data')
  async update(
    @Req() req: FastifyRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: MemoryStorageFile,
  ) {
    return await this.productService.update(
      id,
      updateProductDto,
      req['user'].id,
      file,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiNoContentResponse()
  async remove(
    @Req() req: FastifyRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.productService.remove({ id }, req['user']);
  }
}
