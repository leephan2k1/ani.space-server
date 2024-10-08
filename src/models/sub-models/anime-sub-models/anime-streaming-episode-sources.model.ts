import { BaseEntity } from '~/models/base-models';
import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, ManyToOne } from 'typeorm';
import { AnimeStreamingEpisode } from './anime-streaming-episode.model';
import { AutoMap } from '@automapper/classes';

@ObjectType()
@Entity({ name: 'animeStreamingEpisodeSource' })
export class AnimeStreamingEpisodeSource extends BaseEntity {
  @AutoMap(() => AnimeStreamingEpisode)
  @Field((type) => AnimeStreamingEpisode, { nullable: true })
  @ManyToOne(
    () => AnimeStreamingEpisode,
    (animeStreamingEpisode) => animeStreamingEpisode.sources,
  )
  animeStreamingEpisode: AnimeStreamingEpisode;

  @AutoMap()
  @Field({ nullable: true, description: `url of the episode` })
  @Column({ nullable: true })
  url?: string;

  @AutoMap()
  @Field({ nullable: true, description: `quality of the episode` })
  @Column({ nullable: true })
  quality?: string;

  @AutoMap()
  @Field({
    description: `check whether the source format is m3u8`,
  })
  @Column({ default: false })
  isM3U8: boolean;

  static createSource({
    animeStreamingEpisode,
    url,
    quality,
    isM3U8,
  }: {
    animeStreamingEpisode: AnimeStreamingEpisode;
    url: string;
    quality: string;
    isM3U8: boolean;
  }) {
    return {
      animeStreamingEpisode,
      url,
      quality,
      isM3U8,
    } as AnimeStreamingEpisodeSource;
  }
}
