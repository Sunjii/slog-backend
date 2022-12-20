import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

// mocking with Repository
export const mockRepository = () => ({
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
  findAndCount: jest.fn(),
});

export const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn(),
});

export type MockRepository<T = any> = Partial<
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
      role: UserRole.Admin,
    };
    it('should fail if user exists', async () => {
      usersRepository.findOneOrFail.mockResolvedValue({
        id: 1,
        email: 'test@email.com',
      });
      const result = await service.createUser(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: '이미 가입된 이메일입니다.',
      });
    });

    it('should create a new account', async () => {
      usersRepository.findOne.mockReturnValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockReturnValue(createAccountArgs);
      const result = await service.createUser(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(usersRepository.save).toBeCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);
      expect(result).toEqual({ message: 'Done!', ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.createUser(createAccountArgs);

      expect(result).toEqual({ ok: false, error: '계정 생성 실패!' });
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

    it('should fail if password is wrong', async () => {
      const mockUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)), // wrong password
      };
      usersRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.login(loginArgs);

      expect(result).toEqual({ ok: false, error: '비밀번호가 틀렸습니다.' });
    });

    it('should return token if password correct', async () => {
      const mockUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.login(loginArgs);

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({ ok: true, token: 'signed-token' });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs);

      expect(result).toEqual({ ok: false, error: '로그인 실패' });
    });
  });

  describe('findOne', () => {
    const findOneArgs = {
      id: 1,
    };

    it('should find an exisiting user', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findOneArgs);
      const result = await service.findOne(1);

      expect(result).toEqual({ ok: true, user: findOneArgs });
    });

    it('should fail if user not found', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findOne(1);

      expect(result).toEqual({ ok: false, error: '계정을 찾을 수 없습니다.' });
    });
  });
});
