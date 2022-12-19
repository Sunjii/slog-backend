import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { PostEntity } from '../entities/post.entity';

@ObjectType()
export class PostOutput extends CoreOutput {
  @Field((type) => PostEntity, { nullable: true })
  post?: PostEntity;
}
