import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty({ required: false, default: '' })
  @IsString()
  @MaxLength(500)
  image?: string = '';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  category_name: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}
