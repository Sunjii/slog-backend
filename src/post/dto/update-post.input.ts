import { CreatePostInput } from './create-post.input';
import {
  InputType,
  Field,
  Int,
  PartialType,
  ObjectType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';

@InputType()
export class UpdatePostInput extends PartialType(CreatePostInput) {
  @Field(() => Int)
  id: number;
}

@ObjectType()
export class UpdatePostOutput extends CoreOutput {}
