import { registerEnumType } from '@nestjs/graphql';

export enum SynchronizedAnimeEnum {
  ANIME_SCALAR_TYPE = 'ANIME_SCALAR_TYPE',
  SAVE_ANIME_CHARACTERS_TYPE = 'SAVE_ANIME_CHARACTERS_TYPE',
  SAVE_CHARACTERS_TYPE = 'SAVE_CHARACTERS_TYPE',
  SAVE_STAFFS_TYPE = 'SAVE_STAFFS_TYPE',
}

registerEnumType(SynchronizedAnimeEnum, {
  name: 'SynchronizedAnimeEnum',
});
