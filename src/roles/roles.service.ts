import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { PrismaService } from '../prisma.service';
import { Role } from '../decorators/roles.decorator';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async update(user: any, updateRoleDto: UpdateUserRoleDto) {
    const adminPassword = this.configService.get<string>('adminPassword');

    try {
      if (
        user.role == Role.Admin ||
        updateRoleDto.adminPassword === adminPassword
      )
        return this.prisma.user.update({
          where: { id: updateRoleDto.userId },
          data: { role: Role[updateRoleDto.role] },
        });
      return;
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
