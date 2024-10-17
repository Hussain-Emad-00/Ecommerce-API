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
import { ConfigService } from '@nestjs/config';
import { v4 as uuidV4 } from 'uuid';

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
        token: await this.generateTokens(
          newUser.id,
          newUser.role,
          newUser.verified,
        ),
        role: newUser.role,
      };
    }

    return {
      ...(await this.generateTokens(user.id, user.role, user.verified)),
      role: user.role,
    };
  }

  async validateUser(loginDto: LoginDto) {
    try {
      const { password, ...user } = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      if (user && this.comparePassword(loginDto.password, password))
        return user;
      return;
    } catch (error) {
      throw new NotFoundException();
    }
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
        ...(await this.generateTokens(user.id, user.role, true)),
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
        ...(await this.generateTokens(user.id, user.role, user.verified)),
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

  async refresh(token: string) {
    try {
      const { id, role, verified, refreshToken } =
        await this.prisma.user.findFirst({
          where: { refreshToken: token },
        });

      const date = new Date(+refreshToken.split('@')[1]);

      if (id && date >= new Date())
        return {
          access_token: await this.jwtService.signAsync({ id, role, verified }),
        };
      return;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async generateTokens(id: number, role: string, verified: boolean) {
    const date = new Date();
    date.setDate(date.getDate() + 30);

    const accessToken = await this.jwtService.signAsync({ id, role, verified });
    const { refreshToken } = await this.prisma.user.update({
      where: { id },
      data: { refreshToken: `${uuidV4()}@${date.getTime()}` },
    });

    return { accessToken, refreshToken };
  }

  async logout(id: number) {
    try {
      return this.prisma.user.update({
        where: { id },
        data: { refreshToken: '' },
      });
    } catch (error) {
      throw new NotFoundException();
    }
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
