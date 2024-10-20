import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';

import { ImageInterface } from '../common/interfaces/image.interface';

@Injectable()
export class ImageService {
  private allowedFormats = ['image/png', 'image/jpg', 'image/jpeg'];
  private imagMaxSizer = 1024 * 1024 * 1; // Byte * KiloByte * MegaByte

  constructor() {}

  async create(file: ImageInterface, folder: string) {
    if (!file.size) return;

    if (!this.allowedFormats.includes(file.mimetype))
      throw new BadRequestException(`The ${file.mimetype} is not allowed`);

    if (file.size > this.imagMaxSize)
      throw new BadRequestException(`Max size should be less than ${this.imagMaxSizer}MB`);

    const filename: string = `${Date.now()}_${folder}`;
    const base64data: string = Buffer.from(file.buffer).toString('base64');
    const fileUri: string = `data:${file.mimetype};base64,${base64data}`;

    try {
      const image = await v2.uploader.upload(fileUri, {
        folder,
        public_id: filename,
      });
      return image.url;
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async remove(url: string): Promise<void> {
    try {
      const splitUrl = url.split('/');
      const length = splitUrl.length;
      const folder = splitUrl[length - 2];
      const name = splitUrl[length - 1].split('.')[0];

      await v2.uploader.destroy(`${folder}/${name}`);
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
