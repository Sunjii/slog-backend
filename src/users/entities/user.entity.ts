import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { PostEntity } from 'src/post/entities/post.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class UserEntity extends CoreEntity {
  @Column({ length: 32 })
  @Field((type) => String)
  @IsString()
  username: string;

  @Column({ unique: true })
  @Field((type) => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field((type) => String)
  @IsString()
  password: string;

  @Field((type) => PostEntity)
  @OneToMany((type) => PostEntity, (post) => post.user)
  post: PostEntity[];

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
