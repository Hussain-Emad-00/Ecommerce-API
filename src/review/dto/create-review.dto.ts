import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ required: false, default: '' })
  @IsString()
  @MaxLength(200)
  comment?: string = '';

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @MaxLength(5)
  like?: boolean = false;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @MaxLength(5)
  dislike?: boolean = false;

  @ApiProperty()
  @IsNumber()
  @MaxLength(10)
  productId: number;
}
