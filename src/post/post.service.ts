import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AllPostsInput, AllPostsOutput } from './dto/all-posts.dto';
import { CreatePostInput, CreatePostOutput } from './dto/create-post.input';
import { PostOutput } from './dto/post-output.dto';
import { UpdatePostInput, UpdatePostOutput } from './dto/update-post.input';
import { PostEntity } from './entities/post.entity';

const PAGENATION = 5;
@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly posts: Repository<PostEntity>,
  ) {}

  async create(
    user: UserEntity,
    createPostInput: CreatePostInput,
  ): Promise<CreatePostOutput> {
    try {
      if (user === undefined) {
        throw new Error('작성자 정보가 없습니다');
      }

      const newPost = this.posts.create(createPostInput);
      newPost.userId = user.id;

      await this.posts.save(newPost);
      return {
        ok: true,
      };
    } catch (e) {
      return { ok: false, error: `포스트 작성 실패 ${e}` };
    }
  }

  async findAll({ page }: AllPostsInput): Promise<AllPostsOutput> {
    try {
      const [posts, totalResults] = await this.posts.findAndCount({
        skip: (page - 1) * PAGENATION,
        take: PAGENATION,
        order: {
          createAt: 'DESC',
        },
      });

      if (posts.length === 0) {
        throw new Error('');
      }

      return {
        ok: true,
        posts,
        totalPage: Math.ceil(totalResults / PAGENATION),
        totalResults,
      };
    } catch (e) {
      return {
        ok: false,
        error: '포스트가 하나도 없습니다.',
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

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
