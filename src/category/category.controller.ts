import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiNoContentResponse } from '@nestjs/swagger';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Role, Roles } from '../common/decorators/roles.decorator';
import { RoleGuard } from '../common/guards/role.guard';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll() {
    return await this.categoryService.findAll();
  }

  @Post()
  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.create(createCategoryDto);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiNoContentResponse()
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.remove(id);
  }
}
