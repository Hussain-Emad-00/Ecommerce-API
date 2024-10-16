import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, MaxLength } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty()
  @IsNumber()
  @MaxLength(10)
  productId: number;

  @ApiProperty()
  @IsNumber()
  @MaxLength(10)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @MaxLength(10)
  price: number;
}
