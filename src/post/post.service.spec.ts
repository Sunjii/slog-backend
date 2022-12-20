import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { UserEntity, UserRole } from 'src/users/entities/user.entity';
import {
  mockJwtService,
  mockRepository,
  MockRepository,
} from 'src/users/users.service.spec';
import { PostEntity } from './entities/post.entity';
import { PostService } from './post.service';

describe('PostService', () => {
  let service: PostService;
  let postsRepository: MockRepository<PostEntity>;
  let usersRepository: MockRepository<UserEntity>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: getRepositoryToken(PostEntity), useValue: mockRepository() },
        { provide: JwtService, useValue: mockJwtService() },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    postsRepository = module.get(getRepositoryToken(PostEntity));
    jwtService = module.get<JwtService>(JwtService);

    postsRepository.create({ id: 1, title: 'Title', content: 'Content' });
  });

  const createPostArgs = {
    title: 'Title',
    content: 'Content',
  };
  const mockUser = {
    id: 1,
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

  describe('Find All Posts', () => {
    const findAllArgs = {
      page: 1,
    };

    it('should fail no result', async () => {
      postsRepository.findOneOrFail.mockRejectedValue(findAllArgs);
      const result = await service.findAll(findAllArgs);

      expect(result).toEqual({ ok: false, error: '포스트가 하나도 없습니다.' });
    });

    it('should find all post', async () => {
      // const posts = [
      //   {
      //     id: 1,
      //     title: 'Title',
      //     content: 'Content',
      //     userId: 1,
      //   },
      //   {
      //     id: 2,
      //     title: 'Title2',
      //     content: 'Content2',
      //     userId: 2,
      //   },
      // ];
      // postsRepository.create.mockReturnValue(createPostArgs);
      // postsRepository.save.mockReturnValue(createPostArgs);
      // const result = await service.findAll({ page: 1 });
      // expect(result).toHaveLength(2);
      // expect(result).toContainEqual({
      //   id: 1,
      //   title: 'Title',
      //   content: 'Content',
      //   userId: 1,
      // });

      // TODO: Insert Dummy Data

      //postsRepository.findAndCount.mockResolvedValue(findAllArgs);
      postsRepository.findAndCount.mockImplementation(() =>
        Promise.resolve({
          id: 1,
          title: 'Title',
          content: 'Content',
          userId: 1,
        }),
      );
      const result = await service.findAll(findAllArgs);

      console.log(postsRepository);

      expect(result).toEqual({ ok: true, posts: findAllArgs });
    });
  });
});
