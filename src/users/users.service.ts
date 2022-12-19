import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';
import { UserProfileOutput } from './dto/user-profile.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserInput) {
    try {
      const { username, email, password, role } = createUserDto;

      const exist = await this.users.findOneOrFail({ where: { email } });
      if (exist) {
        return { ok: false, error: '이미 가입된 이메일입니다.' };
      }

      const user = await this.users.save(
        this.users.create({ email, password, username, role }),
      );
      // verification ?

      return { ok: true, message: 'Done!' };
    } catch (e) {
      return { ok: false, error: '계정 생성 실패!' };
    }
  }

  async findOne(id: number): Promise<UserProfileOutput> {
    try {
      // 문법이 조금 바뀜
      const user = await this.users.findOneOrFail({
        where: {
          id: id,
        },
      });
      return {
        ok: true,
        user,
      };
    } catch (e) {
      return {
        ok: false,
        error: '계정을 찾을 수 없습니다.',
      };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({
        where: { email },
        select: ['id', 'password'],
      });

      if (!user) {
        return {
          ok: false,
          error: '존재하지 않는 계정입니다.',
        };
      }

      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: '비밀번호가 틀렸습니다.',
        };
      }
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (e) {
      return {
        ok: false,
        error: '로그인 실패',
      };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
