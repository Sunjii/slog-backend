import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import {
  PagenationInput,
  PagenationOutput,
} from 'src/common/dto/pagenation.dto';
import { PostEntity } from '../entities/post.entity';

@InputType()
export class AllPostsInput extends PagenationInput {}

@ObjectType()
export class AllPostsOutput extends PagenationOutput {
  @Field((type) => [PostEntity], { nullable: true })
  posts?: PostEntity[];
}
