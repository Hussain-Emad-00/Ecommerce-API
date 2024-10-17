import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import { ApiBody, ApiConsumes, ApiNoContentResponse } from '@nestjs/swagger';
import {
  FileInterceptor,
  MemoryStorageFile,
  UploadedFile,
} from '@blazity/nest-file-fastify';

import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  async login(@Req() req: FastifyRequest) {
    const { id, role, verified } = req['user'];

    return await this.authService.generateTokens(id, role, verified);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('profile', {}))
  @ApiConsumes('multipart/form-data')
  async register(
    @Body() registerDto: RegisterDto,
    @UploadedFile() file: MemoryStorageFile,
  ) {
    await this.authService.register(registerDto, file);
  }

  @Post('verify')
  @ApiBody({ type: String, required: true })
  async verify(@Body('token') token: string) {
    return await this.authService.verify(token);
  }

  @Post('new-verify-token')
  @ApiBody({ type: String, required: true })
  async newVerifyToken(@Body('email') email: string) {
    return this.authService.newVerifyToken(email);
  }

  @Patch('refresh')
  async refresh(@Body() RefreshTokenDto: RefreshTokenDto) {
    return await this.authService.refresh(RefreshTokenDto.token);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: FastifyRequest) {
    const { token, role } = await this.authService.googleLoginOrCreate(
      req['user'],
    );
    return { token, role };
  }

  @Patch('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Req() req: FastifyRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(
      req['user'].id,
      changePasswordDto,
    );
  }

  @Post('forgot-password')
  @ApiNoContentResponse()
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    return await this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiNoContentResponse()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  @Get('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiNoContentResponse()
  async logout(@Req() req: FastifyRequest) {
    await this.authService.logout(req['user'].id);
  }
}
