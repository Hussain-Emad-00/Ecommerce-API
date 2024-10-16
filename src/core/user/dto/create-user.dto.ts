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
  @Matches(/^[\w.+\-]+@gmail\.com$/, { message: 'Only Gmail accounts' })
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
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
  password: string;
}
