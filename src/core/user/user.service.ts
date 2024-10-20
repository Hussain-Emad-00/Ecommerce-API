import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../prisma.service';
import { ImageService } from '../../images/image.service';
import { ImageInterface } from '../../common/interfaces/image.interface';
import { MailService } from '../../mail.service';

@Injectable()
export class UserService {
  private readonly userSelectQuery = {
      id: true,
      email: true,
      firstname: true,
      lastname: true,
      picture: true,
      role: true,
      verified: true,
      totalSpent: true,
      createdAt: true,
      updatedAt: true,
    };

  constructor(
    private prisma: PrismaService,
    private imageService: ImageService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: this.userSelectQuery,
    });
  }

  async findOne(where: Prisma.UserWhereUniqueInput) {
    try {
      return await this.prisma.user.findUnique({
        where,
        select: { ...this.userSelectQuery, reviews: true, products: true },
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async create(data: Prisma.UserCreateInput, file: ImageInterface) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) throw new ConflictException();

    data.password = this.hashPassword(data.password.toString().trim());
    data.email = data.email.toString().trim().toLowerCase();
    data.picture = await this.upload(file, 'profile');

    const verifyToken = await this.mailService.sendVerifyLink(data.email);

    return this.prisma.user.create({
      data: {
        ...data,
        cart: { create: {} },
        wishlist: { create: {} },
        verifyToken,
      },
      select: this.userSelectQuery,
    });
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
    _user: any,
    file: ImageInterface,
  ) {
    if (where.id == _user.id || _user.role == 'Admin') {
      const user = await this.prisma.user.findUnique({ where });
      if (!user) throw new NotFoundException();

      if (data.email) {
        data.email = data.email.toString().trim().toLowerCase();
        data.verifyToken = await this.mailService.sendVerifyLink(data.email);
        data.verified = false;
        await this.mailService.sendMessage(user.email, `your email changed to ${data.email}`);
      }
      
      if (data.picture) {
        data.picture = await this.upload(file, 'profile');
        if (user.picture.includes('cloudinary'))
          await this.imageService.remove(user.picture);
      }

      return this.prisma.user.update({
        where,
        data,
        select: this.userSelectQuery,
      });
    } else throw new UnauthorizedException();
  }

  async remove(where: Prisma.UserWhereUniqueInput, user: any) {
    try {
      if (where.id == user.id || user.role == 'Admin')
        await this.prisma.user.delete({ where });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  private async upload(file: ImageInterface, folder: string) {
    return await this.imageService.create(file, folder);
  }

  private hashPassword(password: string) {
    const rounds: number = this.configService.get<number>('passwordHashRounds');
    return hashSync(password, rounds);
  }
}
