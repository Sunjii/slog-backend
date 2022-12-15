import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserInput, CreateUserOutput } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { LoginInput, LoginOutput } from './dto/login.dto';

@Resolver((of) => UserEntity)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation((returns) => CreateUserOutput)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.createUser(createUserInput);
  }

  @Query((returns) => UserEntity)
  findOne(@Args('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Mutation((returns) => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  // @Mutation('updateUser')
  // update(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
  //   return this.usersService.update(updateUserInput.id, updateUserInput);
  // }

  // @Mutation('removeUser')
  // remove(@Args('id') id: number) {
  //   return this.usersService.remove(id);
  // }
}
