import { InputType, Int, Field, PickType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { PostEntity } from '../entities/post.entity';

@InputType()
export class CreatePostInput extends PickType(PostEntity, [
  'title',
  'content',
]) {}

@ObjectType()
export class CreatePostOutput extends CoreOutput {}
