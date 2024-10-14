import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCartDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
