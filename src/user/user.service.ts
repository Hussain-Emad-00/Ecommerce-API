import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma.service';
import { ImageService } from '../images/image.service';
import { ImageInterface } from '../interfaces/image.interface';
import { MailService } from '../mail.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private imageService: ImageService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async findAll() {
    const users = await this.prisma.user.findMany();
    users.filter((user) => (user.password = undefined));

    return users;
  }

  async findOne(where: Prisma.UserWhereUniqueInput) {
    try {
      const { password, ...user } = await this.prisma.user.findUnique({
        where,
        include: { reviews: true, products: true },
      });

      return user;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async create(data: Prisma.UserCreateInput, file: ImageInterface) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (user) throw new ConflictException();

    data.password = this.hashPassword(data.password.toString().trim());
    data.email = data.email.toString().trim().toLowerCase();
    data.picture = await this.upload(file, 'profile');

    const verifyToken = await this.mailService.sendVerifyLink(data.email);

    const { password, ...newUser } = await this.prisma.user.create({
      data: {
        ...data,
        cart: { create: {} },
        wishlist: { create: {} },
        verifyToken,
      },
    });
    return newUser;
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

      if (data.email) data.email = data.email.toString().trim().toLowerCase();
      if (data.picture) {
        data.picture = await this.upload(file, 'profile');
        if (user.picture.includes('cloudinary'))
          await this.imageService.remove(user.picture);
      }

      const { password, ...updatedUser } = await this.prisma.user.update({
        where,
        data,
      });
      return updatedUser;
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
