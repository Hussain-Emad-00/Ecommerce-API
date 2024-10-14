import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateWishlistDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
