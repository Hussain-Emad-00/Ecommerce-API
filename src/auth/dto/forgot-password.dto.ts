import { IsEmail, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  @MaxLength(80)
  @Matches(/^gmail.com$/, { message: 'Only Gmail accounts' })
  email: string;
}
