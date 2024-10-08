import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IAnimevsubService } from '~/contracts/services';
import { AnimevsubService } from '~/services';
import { MediaModule } from './media.module';
import { AnimeVsubConfig } from '../configs/index';

@Module({
  imports: [
    MediaModule,

    ConfigModule.forFeature(AnimeVsubConfig),

    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          baseURL: configService.get<string>('ANIMEVSUB_ENDPOINT') as string,
          headers: {
            Origin: configService.get<string>('ANIMEVSUB_ENDPOINT') as string,
            Referer: configService.get<string>('ANIMEVSUB_ENDPOINT') as string,
            Accept: '*/*',
            'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36`,
          },
        };
      },
    }),
  ],
  providers: [
    {
      provide: IAnimevsubService,
      useClass: AnimevsubService,
    },
  ],
})
export class AnimevsubModule {}
