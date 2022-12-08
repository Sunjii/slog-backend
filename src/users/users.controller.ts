import { Controller, Get, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  findAll(): string {
    return 'This return all users';
  }

  @Get('/:id')
  find(@Param('id') userId: string): string {
    return `This return ${userId} user`;
  }
}
