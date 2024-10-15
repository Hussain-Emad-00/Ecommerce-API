import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength, IsNotEmpty } from 'class-validator';

import { Role } from '../../decorators/roles.decorator';

export class UpdateUserRoleDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ enum: Role, default: Role.Member })
  @IsString()
  @MaxLength(6)
  role?: Role = Role.Member;

  @ApiProperty()
  @IsString()
  @MaxLength(30)
  adminPassword: string;
}
