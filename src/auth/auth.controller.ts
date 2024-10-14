import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FastifyReply, FastifyRequest } from 'fastify';
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @ApiBody({ type: LoginDto })
  async login(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const { id, role } = req['user'];
    const token = await this.authService.generateToken(id, role);
    return this.authService.setToken(res, { token, role });
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
  async verify(@Body('token') token: string, @Res() res: FastifyReply) {
    return this.authService.setToken(res, await this.authService.verify(token));
  }

  @Post('new-verify-token')
  @ApiBody({ type: String, required: true })
  async newVerifyToken(@Body('email') email: string) {
    return this.authService.newVerifyToken(email);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: FastifyRequest) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const { token, role } = await this.authService.googleLoginOrCreate(
      req['user'],
    );
    return this.authService.setToken(res, { token, role });
  }

  @Patch('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const { token, role } = await this.authService.changePassword(
      req['user'].id,
      changePasswordDto,
    );
    return this.authService.setToken(res, { token, role });
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
  logout(@Res() res: FastifyReply) {
    res.clearCookie('access_token').send();
  }
}
