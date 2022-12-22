import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { CommentEntity } from '../entities/comment.entity';

@InputType()
export class CreateCommentInput extends PickType(CommentEntity, [
  'content',
  'postId',
  'commenter',
  'password',
]) {}

@ObjectType()
export class CreateCommentOutput extends CoreOutput {}
