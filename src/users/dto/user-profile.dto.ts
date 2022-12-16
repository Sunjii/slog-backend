import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { UserEntity } from '../entities/user.entity';

@ObjectType()
export class UserProfileOutput extends CoreOutput {
  @Field((type) => UserEntity, { nullable: true })
  user?: UserEntity;
}
