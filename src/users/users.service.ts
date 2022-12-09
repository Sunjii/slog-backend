import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserInput) {
    const { username, email, password } = createUserDto;

    const exist = await this.users.findOneBy({ email });
    if (exist) {
      return { ok: false, error: 'Already' };
    }

    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: number) {
    try {
      const user = await this.users.findOneByOrFail({ id });
      console.log(user);
      return user;
      // return {
      //   ok: true,
      //   user,
      // };
    } catch (e) {
      return {
        ok: false,
        error: 'User Not Found',
      };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
