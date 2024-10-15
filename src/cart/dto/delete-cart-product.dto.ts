import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteCartProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
