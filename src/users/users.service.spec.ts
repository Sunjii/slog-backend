import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

// mocking with Repository
const mockRepository = () => ({
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn(),
});

type MockRepository<T = any> = Partial<
  Record<keyof Repository<UserEntity>, jest.Mock>
>;

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<UserEntity>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(UserEntity), useValue: mockRepository() },
        { provide: JwtService, useValue: mockJwtService() },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(UserEntity));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create Account', () => {
    const createAccountArgs = {
      email: 'test@gmail.com',
      password: 'testing',
      username: 'testAcc',
    };
    it('should fail if user exists', async () => {
      usersRepository.findOneBy.mockResolvedValue({
        id: 1,
        email: 'test@email',
      });
      const result = await service.createUser(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: '이미 가입된 이메일입니다.',
      });
    });
  });

  describe('login', () => {
    const loginArgs = { email: '', password: '' };
    it('should fail if user does not exit', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);
      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({ ok: false, error: '존재하지 않는 계정입니다.' });
    });
  });
});
