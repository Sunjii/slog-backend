import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { CommentEntity } from './comment.entity';

@InputType('PostInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class PostEntity extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  title: string;

  @Field((type) => String)
  @Column()
  @IsString()
  content: string;

  @Field((type) => UserEntity)
  @ManyToOne((type) => UserEntity, {
    onDelete: 'CASCADE',
  })
  user: Promise<UserEntity>;

  @Column()
  @RelationId((post: PostEntity) => post.user)
  userId: number;

  @Field((type) => Number)
  @Column({ default: 0 })
  @IsNumber()
  readCount: number;
}
