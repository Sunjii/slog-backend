import { PickType } from '@nestjs/graphql';
import { UserEntity } from '../entities/user.entity';

// PickType : 기존 '엔티티'에서 특정 필드만 골라쓴다
export class CreateUserDto extends PickType(UserEntity, [
  'username',
  'email',
  'password',
]) {}
