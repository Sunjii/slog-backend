import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PostService } from './post.service';
import { PostEntity } from './entities/post.entity';
import { CreatePostInput, CreatePostOutput } from './dto/create-post.input';
import { UpdatePostInput, UpdatePostOutput } from './dto/update-post.input';
import { PostOutput } from './dto/post-output.dto';
import { AllPostsInput, AllPostsOutput } from './dto/all-posts.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { DeletePostInput, DeletePostOutput } from './dto/delete-post.dto';

@Resolver((of) => PostEntity)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation((returns) => CreatePostOutput)
  @Role(['Owner', 'Admin'])
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

  @Mutation(() => UpdatePostOutput)
  @Role(['Owner', 'Admin'])
  updatePost(
    @AuthUser() authUser: UserEntity,
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
  ): Promise<UpdatePostOutput> {
    return this.postService.update(authUser, updatePostInput);
  }

  @Mutation(() => DeletePostOutput)
  @Role(['Owner', 'Admin'])
  removePost(
    @AuthUser() authUser: UserEntity,
    @Args('input') deletePostInput: DeletePostInput,
  ): Promise<DeletePostOutput> {
    return this.postService.remove(authUser, deletePostInput);
  }
}
