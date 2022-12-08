import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserInput } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Resolver((of) => UserEntity)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // @Mutation('createUser')
  // create(@Args('createUserInput') createUserInput: CreateUserDto) {
  //   return this.usersService.create(createUserInput);
  // }

  @Query((returns) => UserEntity)
  findAll() {
    return this.usersService.findAll();
  }

  // @Query('user')
  // findOne(@Args('id') id: number) {
  //   return this.usersService.findOne(id);
  // }

  // @Mutation('updateUser')
  // update(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
  //   return this.usersService.update(updateUserInput.id, updateUserInput);
  // }

  // @Mutation('removeUser')
  // remove(@Args('id') id: number) {
  //   return this.usersService.remove(id);
  // }
}
