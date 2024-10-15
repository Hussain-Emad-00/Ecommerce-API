import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteWishlistProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
