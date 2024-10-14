import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

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
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  price: string;

  @ApiProperty({ required: false, default: '' })
  @IsString()
  @MaxLength(500)
  image?: string = '';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  category_name: string;
}
