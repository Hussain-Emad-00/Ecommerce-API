import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength } from 'class-validator';

import { Role } from '../../decorators/roles.decorator';

export class UpdateRoleDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty({ required: false, enum: Role, default: Role.Member })
  @IsString()
  @MaxLength(6)
  role?: Role = Role.Member;

  @ApiProperty({ required: false, default: '' })
  @IsString()
  @MaxLength(30)
  adminPassword?: string = '';
}
