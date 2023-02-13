import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';

@InputType()
export class DeletePostInput {
  @Field((type) => Number)
  postId: number;
}

@ObjectType()
export class DeletePostOutput extends CoreOutput {}
