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
import { SearchPostInput, SearchPostOutput } from './dto/search-post.dto';
import {
  CreateCommentInput,
  CreateCommentOutput,
} from './dto/create-comment.dto';
import { GetCommentsInput, GetCommentsOutput } from './dto/get-comments.dto';

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
  // FIXME: 다른 계정으로도 삭제가 됨
  removePost(
    @AuthUser() authUser: UserEntity,
    @Args('input') deletePostInput: DeletePostInput,
  ): Promise<DeletePostOutput> {
    return this.postService.remove(authUser, deletePostInput);
  }

  @Query((returns) => SearchPostOutput)
  searchPost(
    @Args('input') searchPostInput: SearchPostInput,
  ): Promise<SearchPostOutput> {
    return this.postService.search(searchPostInput);
  }

  //
  //
  /** COMMENT */
  //
  //
  @Mutation(() => CreateCommentOutput)
  @Role(['Admin', 'Owner'])
  createComment(
    @AuthUser() authUser: UserEntity,
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
  ): Promise<CreateCommentOutput> {
    return this.postService.createComment(authUser, createCommentInput);
  }

  @Query((returns) => GetCommentsOutput)
  getComments(
    @Args('getCommentsInput') getCommentsInput: GetCommentsInput,
  ): Promise<GetCommentsOutput> {
    return this.postService.getComments(getCommentsInput);
  }
}
