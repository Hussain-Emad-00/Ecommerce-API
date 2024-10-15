import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, MaxLength } from 'class-validator';

export class PaginateProductsDto {
  @ApiProperty({ required: false, default: 1 })
  @IsNumber()
  @MaxLength(10)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsNumber()
  @MaxLength(10)
  limit?: number = 10;
}
