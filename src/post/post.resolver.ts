import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PostService } from './post.service';
import { PostEntity } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';

@Resolver((of) => PostEntity)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation((returns) => PostEntity)
  createPost(@Args('createPostInput') createPostInput: CreatePostInput) {
    return this.postService.create(createPostInput);
  }

  @Query((returns) => [PostEntity])
  findAllPosts() {
    return this.postService.findAll();
  }

  @Query((returns) => PostEntity)
  findPostByID(@Args('id', { type: () => Int }) id: number) {
    return this.postService.findOne(id);
  }

  // @Mutation(() => PostEntity)
  // updatePost(@Args('updatePostInput') updatePostInput: UpdatePostInput) {
  //   return this.postService.update(updatePostInput.id, updatePostInput);
  // }

  // @Mutation(() => PostEntity)
  // removePost(@Args('id', { type: () => Int }) id: number) {
  //   return this.postService.remove(id);
  // }
}
