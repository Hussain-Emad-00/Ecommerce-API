import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { compareSync, hashSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { FastifyReply } from 'fastify';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../prisma.service';
import { LoginDto } from './dto/login.dto';
import { GoogleData } from '../../common/interfaces/google-data.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailService } from '../../mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserService } from '../user/user.service';
import { ImageInterface } from '../../common/interfaces/image.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
    @Inject(UserService) private userService: UserService,
  ) {}

  async register(data: Prisma.UserCreateInput, file: ImageInterface) {
    await this.userService.create(data, file);
  }

  async googleLoginOrCreate(googleUser: GoogleData) {
    if (!googleUser) throw new UnauthorizedException();

    const user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      const data = {
        email: googleUser.email.toString().trim().toLowerCase(),
        firstname: googleUser.firstName,
        lastname: googleUser.lastName,
        picture: googleUser.picture,
        verified: true,
        password: this.hashPassword(
          this.configService.get<string>('defaultPassword'),
        ),
      };
      const newUser = await this.prisma.user.create({ data });

      return {
        token: await this.generateToken(
          newUser.id.toString(),
          newUser.role,
          newUser.verified,
        ),
        role: newUser.role,
      };
    }

    return {
      token: await this.generateToken(
        user.id.toString(),
        user.role,
        user.verified,
      ),
      role: user.role,
    };
  }

  async validateUser(loginDto: LoginDto) {
    const { password, ...user } = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (user && this.comparePassword(loginDto.password, password)) return user;
    return;
  }

  async verify(token: string) {
    const date = new Date(+token.split('@')[1]);
    if (!date || date < new Date()) throw new BadRequestException();

    const user = await this.prisma.user.findFirst({
      where: { verifyToken: token },
    });
    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { verified: true, verifyToken: '' },
      });

      return {
        token: await this.generateToken(user.id.toString(), user.role, true),
        role: user.role,
      };
    } else throw new NotFoundException();
  }

  async newVerifyToken(email: string) {
    if (!(await this.verifyTokenTime(email))) {
      const verifyToken = await this.mailService.sendVerifyLink(email);

      return this.prisma.user.update({
        where: { email },
        data: { verifyToken },
      });
    }
    return;
  }

  async changePassword(
    id: number,
    { newPassword, oldPassword }: ChangePasswordDto,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    const isPasswordMatch = this.comparePassword(oldPassword, user.password);

    if (user && isPasswordMatch) {
      newPassword = this.hashPassword(newPassword);

      await this.prisma.user.update({
        where: { id },
        data: { password: newPassword },
      });

      return {
        token: await this.generateToken(
          user.id.toString(),
          user.role,
          user.verified,
        ),
        role: user.role,
      };
    }

    throw new BadRequestException();
  }

  async forgotPassword(email: string) {
    if (!(await this.verifyTokenTime(email))) {
      const resetToken = await this.mailService.sendPasswordResetLink(email);

      return this.prisma.user.update({
        where: { email },
        data: { resetToken },
      });
    }
    return;
  }

  async resetPassword({ token, password }: ResetPasswordDto) {
    const date = new Date(+token.split('@')[1]);
    if (!date || date < new Date()) throw new BadRequestException();

    const user = await this.prisma.user.findFirst({
      where: { resetToken: token },
    });

    password = this.hashPassword(password);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: '', password },
    });
  }

  setToken(res: FastifyReply, data: { token: string; role: string }) {
    res
      .setCookie('access_token', data.token, {
        httpOnly: true,
        secure: true,
        path: '/',
        expires: new Date(Date.now() + 240 * 60 * 60 * 1000),
      })
      .send({ token: data.token, role: data.role });
  }

  async generateToken(id: string, role: string, verified: boolean) {
    return await this.jwtService.signAsync({ id, role, verified });
  }

  private async verifyTokenTime(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException();

    const date = new Date(+user.verifyToken.split('@')[1]);
    return date > new Date();
  }

  private hashPassword(password: string) {
    const rounds: number = this.configService.get<number>('passwordHashRounds');
    return hashSync(password, rounds);
  }

  private comparePassword(password: string, hashedPassword: string) {
    return compareSync(password, hashedPassword);
  }
}
