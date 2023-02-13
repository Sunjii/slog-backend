import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { UserEntity, UserRole } from 'src/users/entities/user.entity';
import {
  mockJwtService,
  mockRepository,
  MockRepository,
} from 'src/users/users.service.spec';
import { CommentEntity } from './entities/comment.entity';
import { PostEntity } from './entities/post.entity';
import { PostService } from './post.service';

describe('PostService', () => {
  let service: PostService;
  let postsRepository: MockRepository<PostEntity>;
  let usersRepository: MockRepository<UserEntity>;
  let jwtService: JwtService;
  let commentsRepository: MockRepository<CommentEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(PostEntity),
          useValue: mockRepository(),
        },
        { provide: JwtService, useValue: mockJwtService() },
        {
          provide: getRepositoryToken(CommentEntity),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    postsRepository = module.get(getRepositoryToken(PostEntity));
    jwtService = module.get<JwtService>(JwtService);
    commentsRepository = module.get(getRepositoryToken(CommentEntity));
  });

  const createPostArgs = {
    title: 'Title',
    content: 'Content',
  };
  const mockPost = {
    id: 1,
    title: 'title',
    content: 'stringg',
    userId: 42,
    readCount: 42,
  };
  const mockUser = {
    id: 42,
    username: 'test',
    email: 'test@email',
    password: '1234',
    role: UserRole.Admin,
    post: [],
    createAt: new Date(),
    updateAt: new Date(),
    hashPassword: jest.fn(),
    checkPassword: jest.fn(),
  };
  const notAllowedUser = {
    id: 404,
    username: 'test',
    email: 'test@email',
    password: '1234',
    role: UserRole.Admin,
    post: [],
    createAt: new Date(),
    updateAt: new Date(),
    hashPassword: jest.fn(),
    checkPassword: jest.fn(),
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(postsRepository).toBeDefined();
    expect(commentsRepository).toBeDefined();
  });

  describe('Create New Post', () => {
    it('should create new Post', async () => {
      postsRepository.create.mockReturnValue(createPostArgs);
      postsRepository.save.mockReturnValue(createPostArgs);
      const result = await service.create(mockUser, createPostArgs);

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      postsRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.create(mockUser, createPostArgs);

      expect(result).toEqual({ ok: false, error: `포스트 작성 실패` });
    });
  });

  describe('Find all post', () => {
    it('should find all post', async () => {
      const findAndCountArgs = {
        skip: 0,
        take: 5,
        order: {
          createAt: 'DESC',
        },
      };

      jest
        .spyOn(postsRepository, 'findAndCount')
        .mockImplementationOnce(async (findAndCountArgs) => [
          { posts: [mockPost] },
          1,
        ]);

      const result = await service.findAll({ page: 1 });

      expect(postsRepository.findAndCount).toBeCalledTimes(1);
      expect(postsRepository.findAndCount).toBeCalledWith(findAndCountArgs);

      expect(result).toEqual({
        ok: true,
        posts: { posts: [mockPost] },
        totalPage: 1,
        totalResults: 1,
      });
    });

    it('should fail on exception', async () => {
      postsRepository.findAndCount.mockRejectedValue(new Error());

      const result = await service.findAll({ page: 1 });
      expect(result).toEqual({ ok: false, error: 'FindAll 호출 실패' });
    });
  });

  describe('Fine one', () => {
    it('should find one', async () => {
      postsRepository.findOneOrFail.mockResolvedValue(mockPost);
      const result = await service.findOne(1);
      expect(result).toEqual({ ok: true, post: mockPost });
    });

    it('shoul fail on exception', async () => {
      postsRepository.findOneOrFail.mockRejectedValue(null);
      const result = await service.findOne(1);
      expect(result).toEqual({
        ok: false,
        error: '1 포스트를 찾을 수 없습니다.',
      });
    });
  });

  describe('Update post', () => {
    const updatePostInput = {
      id: 1,
      title: 'new Title',
    };
    const findOnePost = it('should update post', async () => {
      postsRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.update(mockUser, updatePostInput);

      expect(postsRepository.findOne).toBeCalledTimes(1);
      expect(postsRepository.findOne).toBeCalledWith({
        where: { id: updatePostInput.id },
      });
      expect(postsRepository.save).toBeCalledTimes(1);
      expect(postsRepository.save).toBeCalledWith([updatePostInput]);
      expect(result).toEqual({ ok: true });
    });

    it('should fail on cannot find post', async () => {
      postsRepository.findOne.mockResolvedValue(null);

      const result = await service.update(mockUser, updatePostInput);

      expect(result).toEqual({
        ok: false,
        error: '포스트를 찾을 수 없습니다.',
      });
    });

    it('should fail on un-auth', async () => {
      postsRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.update(notAllowedUser, updatePostInput);

      expect(postsRepository.findOne).toBeCalledTimes(1);
      expect(postsRepository.findOne).toBeCalledWith({
        where: { id: updatePostInput.id },
      });
      expect(result).toEqual({ ok: false, error: '수정할 권한이 없습니다.' });
    });

    it('should fail on exception on save', async () => {
      postsRepository.findOne.mockResolvedValue(mockPost);
      postsRepository.save.mockRejectedValue(new Error());

      const result = await service.update(mockUser, updatePostInput);

      expect(result).toEqual({ ok: false, error: '포스트 수정 실패!' });
    });
  });

  describe('Remove post', () => {
    it('should remove post', async () => {
      postsRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.remove(mockUser, { postId: 1 });

      expect(postsRepository.findOne).toBeCalledTimes(1);
      expect(postsRepository.findOne).toBeCalledWith({ where: { id: 1 } });
      expect(postsRepository.delete).toBeCalledTimes(1);
      expect(postsRepository.delete).toBeCalledWith(1);
      expect(result).toEqual({ ok: true });
    });

    it('should fail cannot found post', async () => {
      postsRepository.findOne.mockResolvedValue(null);

      const result = await service.remove(mockUser, { postId: 1 });

      expect(postsRepository.findOne).toBeCalledTimes(1);
      expect(postsRepository.findOne).toBeCalledWith({ where: { id: 1 } });
      expect(result).toEqual({
        ok: false,
        error: '포스트를 찾을 수 없습니다.',
      });
    });

    it('should fail by non-auth', async () => {
      postsRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.remove(notAllowedUser, { postId: 1 });

      expect(postsRepository.findOne).toBeCalledTimes(1);
      expect(postsRepository.findOne).toBeCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ ok: false, error: '삭제할 권한이 없습니다.' });
    });

    it('should fail on exception', async () => {
      postsRepository.findOne.mockRejectedValue(new Error());

      const result = await service.remove(mockUser, { postId: 1 });

      expect(result).toEqual({ ok: false, error: '삭제 실패' });
    });
  });

  describe('Search post', () => {
    const query = 'title';
    it('should search post', async () => {
      const findAndCountArgs = {
        where: {
          title: ILike(`%${query}%`),
        },
        skip: 0,
        take: 5,
      };

      jest
        .spyOn(postsRepository, 'findAndCount')
        .mockImplementationOnce(async (findAndCountArgs) => [
          { posts: [mockPost] },
          1,
        ]);

      const result = await service.search({ query, page: 1 });

      expect(postsRepository.findAndCount).toBeCalledTimes(1);
      expect(postsRepository.findAndCount).toBeCalledWith(findAndCountArgs);
      expect(result).toEqual({
        ok: true,
        searchingResults: { posts: [mockPost] },
        totalResults: 1,
        totalPage: 1,
      });
    });

    it('should fail on exception', async () => {
      postsRepository.findAndCount.mockRejectedValue(new Error());

      const result = await service.search({ query, page: 1 });

      expect(result).toEqual({ ok: false, error: '검색 실패' });
    });
  });

  //
  //
  //  COMMENT
  //
  //

  describe('Create comment', () => {});
});
