import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AllPostsInput, AllPostsOutput } from './dto/all-posts.dto';
import { CreatePostInput } from './dto/create-post.input';
import { PostOutput } from './dto/post-output.dto';
import { UpdatePostInput } from './dto/update-post.input';
import { PostEntity } from './entities/post.entity';

const PAGENATION = 5;
@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly posts: Repository<PostEntity>,
  ) {}

  async create(user: UserEntity, createPostInput: CreatePostInput) {
    try {
      console.log(user);
      if (user === undefined) {
        throw new Error('작성자 정보가 없습니다');
      }
      const newPost = this.posts.create(createPostInput);
      newPost.user = user;

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

  update(id: number, updatePostInput: UpdatePostInput) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
