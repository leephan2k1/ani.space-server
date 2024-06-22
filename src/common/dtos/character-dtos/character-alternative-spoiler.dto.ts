import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { BaseDto } from '../base-dtos/base.dto';

@ObjectType()
export class CharacterAlternativeSpoilersDto extends BaseDto {
  @AutoMap()
  @Field({ nullable: true })
  name?: string;
}
