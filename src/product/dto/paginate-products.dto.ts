import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class PaginateProductsDto {
  @ApiProperty({ required: false, default: 1 })
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsNumber()
  limit?: number = 10;
}
