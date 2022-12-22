import { InternalServerErrorException } from '@nestjs/common';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { PostEntity } from './post.entity';
import * as bcrypt from 'bcrypt';

@InputType('CommentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class CommentEntity extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  content: string;

  @Field((type) => Number, { defaultValue: 0 })
  @Column()
  @IsNumber()
  vote: number;

  @Field((type) => UserEntity)
  @ManyToOne((type) => UserEntity, {
    onDelete: 'CASCADE',
  })
  user: Promise<UserEntity>;

  @Column()
  @RelationId((comment: CommentEntity) => comment.user)
  userId: number;

  @Field((type) => PostEntity)
  @ManyToOne((type) => PostEntity, { onDelete: 'CASCADE' })
  post: Promise<PostEntity>;

  @Field()
  @Column()
  @RelationId((comment: CommentEntity) => comment.post)
  postId: number;

  // 비로그인 유저를 위한 컬럼
  @Field((type) => String, { nullable: true })
  @Column()
  @IsString()
  commenter: string;

  @Field((type) => String, { nullable: true })
  @Column({ select: false })
  @IsString()
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }
  async checkPassword(aPAssword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPAssword, this.password);
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
