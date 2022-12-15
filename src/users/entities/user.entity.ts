import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { InternalServerErrorException } from '@nestjs/common';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  @Field((type) => String)
  id: number;

  @Column({ length: 32 })
  @Field((type) => String)
  username: string;

  @Column({ unique: true })
  @Field((type) => String)
  email: string;

  @Column({ length: 32 })
  @Field((type) => String)
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

  @CreateDateColumn()
  @Field((type) => Date)
  createdAt: Date;

  @CreateDateColumn()
  @Field((type) => Date)
  updatedAt: Date;
}
