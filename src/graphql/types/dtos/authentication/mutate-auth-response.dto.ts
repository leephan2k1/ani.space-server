import { Field, ObjectType } from '@nestjs/graphql';
import { ResponseStatus } from '~/common/types/void-response.enum';

@ObjectType()
export class MutateAuthResponse {
  @Field(() => ResponseStatus)
  status: ResponseStatus;

  constructor(partial?: Partial<MutateAuthResponse>) {
    Object.assign(this, partial);
  }
}
