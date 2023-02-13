import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommentEntity } from '../entities/comment.entity';
import {
  PagenationInput,
  PagenationOutput,
} from 'src/common/dto/pagenation.dto';

@InputType()
export class GetCommentsInput {
  @Field((type) => Number)
  postId: number;
}

@ObjectType()
export class GetCommentsOutput extends PagenationOutput {
  @Field((type) => [CommentEntity], { nullable: true })
  comments?: CommentEntity[];
}
