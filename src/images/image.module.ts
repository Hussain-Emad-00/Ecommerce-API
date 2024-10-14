import { Module } from '@nestjs/common';

import { ImageService } from './image.service';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  providers: [CloudinaryProvider, ImageService],
  exports: [ImageService],
})
export class ImageModule {}
