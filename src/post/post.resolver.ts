import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PostService } from './post.service';
import { PostEntity } from './entities/post.entity';
import { CreatePostInput, CreatePostOutput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { PostOutput } from './dto/post-output.dto';
import { AllPostsInput, AllPostsOutput } from './dto/all-posts.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { AuthUser } from 'src/auth/auth-user.decorator';

@Resolver((of) => PostEntity)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation((returns) => CreatePostOutput)
  async createPost(
    @AuthUser() authUser: UserEntity,
    @Args('createPostInput') createPostInput: CreatePostInput,
  ): Promise<CreatePostOutput> {
    return this.postService.create(authUser, createPostInput);
  }

  @Query((returns) => AllPostsOutput)
  findAllPosts(
    @Args('input') postsInput: AllPostsInput,
  ): Promise<AllPostsOutput> {
    return this.postService.findAll(postsInput);
  }

  @Query((returns) => PostOutput)
  findPostByID(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<PostOutput> {
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
