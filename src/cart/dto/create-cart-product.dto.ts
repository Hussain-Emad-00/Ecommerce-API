import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCartProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
