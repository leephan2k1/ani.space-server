import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Anime } from './anime.model';
import { BaseEntity } from './base-models';
import { Character } from './character.model';
import { Staff } from './staff.model';
import { AnimeRelation } from './sub-models/anime-sub-models';
import { AnimeConnection } from './sub-models/anime-sub-models/anime-connection.model';
import { CharacterRole } from './sub-models/character-sub-models';
import { StaffRoleType } from './sub-models/staff-sub-models/staff-role-type.model';
import { AutoMap } from '@automapper/classes';

@ObjectType()
@Entity({ name: 'animeEdges' })
export class AnimeEdge extends BaseEntity {
  @AutoMap()
  @Column()
  @Field((type) => Int)
  idAnilist: number;

  @ManyToOne(() => AnimeConnection, (animeConnection) => animeConnection.edges)
  animeConnection: AnimeConnection;

  @AutoMap(() => Anime)
  @Field((type) => Anime, { nullable: true })
  @ManyToOne(() => Anime)
  node?: Anime;

  @AutoMap()
  @Field((type) => AnimeRelation, {
    nullable: true,
    description: 'The type of relation to the parent model',
  })
  @Column({
    type: 'enum',
    enum: AnimeRelation,
    enumName: 'AnimeRelation',
    nullable: true,
  })
  relationType?: AnimeRelation;

  @AutoMap()
  @Field({
    description:
      'If the studio is the main animation studio of the media (For Studio->MediaConnection field only)',
  })
  @Column()
  isMainStudio: boolean;

  @AutoMap(() => [Character])
  @Field((type) => [Character], {
    nullable: true,
    description: 'The characters in the media voiced by the parent actor',
  })
  @ManyToMany(() => Character)
  @JoinTable()
  characters: Character[];

  @AutoMap()
  @Field((type) => CharacterRole, {
    nullable: true,
    description: 'The characters role in the media',
  })
  @Column({
    type: 'enum',
    enum: CharacterRole,
    nullable: true,
  })
  characterRole?: CharacterRole;

  @AutoMap()
  @Field({ nullable: true, description: 'Media specific character name' })
  @Column({ nullable: true })
  characterName?: string;

  @AutoMap()
  @Field({
    nullable: true,
    description: `Notes regarding the VA's role for the character`,
  })
  @Column({ nullable: true })
  roleNotes?: string;

  @AutoMap()
  @Field({
    nullable: true,
    description: `Used for grouping roles where multiple dubs exist for the same language. Either dubbing company name or language variant.`,
  })
  @Column({ nullable: true })
  dubGroup?: string;

  @AutoMap()
  @Field({
    nullable: true,
    description: `The role of the staff member in the production of the media`,
  })
  @Column({ nullable: true })
  staffRole?: string;

  @AutoMap(() => [Staff])
  @Field((type) => [Staff], {
    nullable: true,
    description: 'The voice actors of the character',
  })
  @ManyToMany(() => Staff)
  @JoinTable()
  voiceActors: Staff[];

  @AutoMap(() => [StaffRoleType])
  @Field((type) => [StaffRoleType], {
    nullable: true,
    description: 'The voice actors of the character with role date',
  })
  @OneToMany(
    () => StaffRoleType,
    (voiceActorRoles) => voiceActorRoles.animeEdge,
  )
  voiceActorRoles?: StaffRoleType[];

  @AutoMap()
  @Field((type) => Int, {
    nullable: true,
    description:
      'The order the media should be displayed from the users favourites',
  })
  @Column({ type: 'int', nullable: true })
  favouriteOrder?: number;
}
