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
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import {
  FileInterceptor,
  MemoryStorageFile,
  UploadedFile,
} from '@blazity/nest-file-fastify';
import { ApiConsumes, ApiNoContentResponse } from '@nestjs/swagger';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, Roles } from '../../common/decorators/roles.decorator';
import { RoleGuard } from '../../common/guards/role.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  /***
   @Roles(Role.Admin)
   @UseGuards(AuthGuard('jwt'), RoleGuard)
   ***/
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findOne({ id });
  }

  @Post()
  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @UseInterceptors(FileInterceptor('profile', {}))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: MemoryStorageFile,
  ) {
    return await this.userService.create(createUserDto, file);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('profile', {}))
  @ApiConsumes('multipart/form-data')
  async update(
    @Req() req: FastifyRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: MemoryStorageFile,
  ) {
    return await this.userService.update(
      { id },
      updateUserDto,
      req['user'],
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
    return await this.userService.remove({ id }, req['user']);
  }
}
