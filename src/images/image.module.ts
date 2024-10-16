import { Module } from '@nestjs/common';

import { ImageService } from './image.service';
import { CloudinaryProvider } from '../common/providers/cloudinary.provider';

@Module({
  providers: [CloudinaryProvider, ImageService],
  exports: [ImageService],
})
export class ImageModule {}
