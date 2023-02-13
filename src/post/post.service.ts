import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { FindManyOptions, ILike, Repository } from 'typeorm';
import { AllPostsInput, AllPostsOutput } from './dto/all-posts.dto';
import {
  CreateCommentInput,
  CreateCommentOutput,
} from './dto/create-comment.dto';
import { CreatePostInput, CreatePostOutput } from './dto/create-post.input';
import { DeletePostInput, DeletePostOutput } from './dto/delete-post.dto';
import { GetCommentsInput, GetCommentsOutput } from './dto/get-comments.dto';
import { PostOutput } from './dto/post-output.dto';
import { SearchPostInput, SearchPostOutput } from './dto/search-post.dto';
import { UpdatePostInput, UpdatePostOutput } from './dto/update-post.input';
import { CommentEntity } from './entities/comment.entity';
import { PostEntity } from './entities/post.entity';

const PAGENATION = 5;
@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly posts: Repository<PostEntity>,
    @InjectRepository(CommentEntity)
    private readonly comments: Repository<CommentEntity>,
  ) {}

  async create(
    user: UserEntity,
    createPostInput: CreatePostInput,
  ): Promise<CreatePostOutput> {
    try {
      const newPost = this.posts.create(createPostInput);
      newPost.userId = user.id;

      await this.posts.save(newPost);
      return {
        ok: true,
      };
    } catch (e) {
      return { ok: false, error: `포스트 작성 실패` };
    }
  }

  async findAll({ page }: AllPostsInput): Promise<AllPostsOutput> {
    try {
      const findAndCountArgs = {
        skip: (page - 1) * PAGENATION,
        take: PAGENATION,
        order: {
          createAt: 'DESC',
        },
      } as FindManyOptions<PostEntity>;

      const [posts, totalResults] = await this.posts.findAndCount(
        findAndCountArgs,
      );

      return {
        ok: true,
        posts,
        totalPage: Math.ceil(totalResults / PAGENATION),
        totalResults,
      };
    } catch (e) {
      return {
        ok: false,
        error: `FindAll 호출 실패`,
      };
    }
  }

  async findOne(id: number): Promise<PostOutput> {
    try {
      const post = await this.posts.findOneOrFail({ where: { id } });
      return {
        ok: true,
        post,
      };
    } catch (e) {
      return {
        ok: false,
        error: `${id} 포스트를 찾을 수 없습니다.`,
      };
    }
  }

  async update(
    user: UserEntity,
    updatePostInput: UpdatePostInput,
  ): Promise<UpdatePostOutput> {
    try {
      // find post
      const post = await this.posts.findOne({
        where: { id: updatePostInput.id },
      });
      if (!post) {
        return {
          ok: false,
          error: '포스트를 찾을 수 없습니다.',
        };
      }

      if (user.id !== post.userId) {
        return {
          ok: false,
          error: '수정할 권한이 없습니다.',
        };
      }

      await this.posts.save([
        {
          id: updatePostInput.id,
          ...updatePostInput,
        },
      ]);

      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: '포스트 수정 실패!',
      };
    }
  }

  async remove(
    user: UserEntity,
    { postId }: DeletePostInput,
  ): Promise<DeletePostOutput> {
    try {
      const post = await this.posts.findOne({ where: { id: postId } });
      if (!post) {
        return {
          ok: false,
          error: '포스트를 찾을 수 없습니다.',
        };
      }

      if (user.id !== post.userId) {
        return {
          ok: false,
          error: '삭제할 권한이 없습니다.',
        };
      }

      await this.posts.delete(postId);
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: '삭제 실패',
      };
    }
  }

  async search({ query, page }: SearchPostInput): Promise<SearchPostOutput> {
    try {
      const [posts, totalResults] = await this.posts.findAndCount({
        where: {
          title: ILike(`%${query}%`),
        },
        skip: (page - 1) * PAGENATION,
        take: PAGENATION,
      });

      return {
        ok: true,
        searchingResults: posts,
        totalResults,
        totalPage: Math.ceil(totalResults / PAGENATION),
      };
    } catch (e) {
      return {
        ok: false,
        error: '검색 실패',
      };
    }
  }

  //
  //
  /** COMMENT */
  //
  //

  // TODO: null로 쿼리 처리가 안 되니까 비회원 댓글 기능은 별도 api로 분리해야할듯
  async createComment(
    user: UserEntity,
    { content, postId, commenter, password }: CreateCommentInput,
  ): Promise<CreateCommentOutput> {
    try {
      // 로그인 유저라면
      if (!user) {
        return {
          ok: false,
          error: '잘못된 유저 정보입니다.',
        };
      }

      const currentPost = await this.posts.findOne({ where: { id: postId } });
      if (!currentPost) {
        return {
          ok: false,
          error: '포스트 정보가 없습니다.',
        };
      }

      if (currentPost) {
        const newComment = await this.comments.create({
          content,
          postId,
          commenter,
          password,
        });
        newComment.userId = user.id;
        newComment.vote = 0;

        await this.comments.save(newComment);
        return {
          ok: true,
        };
      } else {
        return {
          ok: false,
          error: '잘못된 포스트 혹은 댓글 정보입니다.',
        };
      }
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: '코멘트 작성 실패',
      };
    }
  }

  async getComments({ postId }: GetCommentsInput): Promise<GetCommentsOutput> {
    const findAndCountArgs = {
      // TODO: comments에도 페지네이션?
      // skip: (page - 1) * PAGENATION,
      // take: PAGENATION,
      order: {
        createAt: 'DESC',
      },
      where: {
        postId,
      },
    } as FindManyOptions<CommentEntity>;

    const currentPost = await this.posts.findOne({ where: { id: postId } });
    if (!currentPost) {
      return {
        ok: false,
        error: '포스트가 없습니다.',
      };
    }

    const [comments, totalResults] = await this.comments.findAndCount(
      findAndCountArgs,
    );

    return {
      ok: true,
      comments,
      totalPage: 42,
      totalResults,
    };
  }
}
