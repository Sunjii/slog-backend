import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { stringify } from 'querystring';
import { CoreOutput } from 'src/common/dto/output.dto';
import {
  PagenationInput,
  PagenationOutput,
} from 'src/common/dto/pagenation.dto';
import { PostEntity } from '../entities/post.entity';

@InputType()
export class SearchPostInput extends PagenationInput {
  @Field((type) => String)
  query: string;
}

@ObjectType()
export class SearchPostOutput extends PagenationOutput {
  @Field((type) => [PostEntity], { nullable: true })
  searchingResults?: PostEntity[];
}
