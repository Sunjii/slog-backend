import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@InputType('PostInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class PostEntity extends CoreEntity {
  @Field((type) => UserEntity)
  @ManyToOne((type) => UserEntity, (user) => user.post)
  user: UserEntity;

  @RelationId((post: PostEntity) => post.user)
  userId: number;

  @Field((type) => String)
  @Column()
  @IsString()
  title: string;

  @Field((type) => String)
  @Column()
  @IsString()
  content: string;
}
