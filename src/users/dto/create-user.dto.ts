import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { UserEntity } from '../entities/user.entity';

// PickType : 기존 '엔티티'에서 특정 필드만 골라쓴다
@InputType()
export class CreateUserInput extends PickType(UserEntity, [
  'username',
  'email',
  'password',
]) {}

@ObjectType()
export class CreateUserOutput extends CoreOutput {}
