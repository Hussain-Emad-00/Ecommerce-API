import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { RolesService } from './roles.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FastifyRequest } from 'fastify';

@UseGuards(AuthGuard('jwt'))
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Patch()
  async update(
    @Req() req: FastifyRequest,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return await this.rolesService.update(req['user'], updateRoleDto);
  }
}
