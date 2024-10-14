import { ConfigOptions, v2 } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
  provide: 'Cloudinary',
  useFactory: async (configService: ConfigService): Promise<ConfigOptions> => {
    return v2.config({
      cloud_name: configService.get<string>('cloudinaryCloudName'),
      api_key: configService.get<string>('cloudinaryApiKey'),
      api_secret: configService.get<string>('cloudinaryApiSecret'),
    });
  },
  inject: [ConfigService],
};
