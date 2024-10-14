import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @MinLength(10)
  @MaxLength(100)
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  firstname: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  lastname: string;

  @ApiProperty({ required: false, default: '' })
  @IsString()
  picture?: string = '';

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^(?=.*[0-9])/)
  password: string;
}
