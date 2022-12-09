import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as argon2 from 'argon2';
import { Field, InputType, ObjectType } from '@nestjs/graphql';

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
  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }

  @CreateDateColumn()
  @Field((type) => Date)
  createdAt: Date;

  @CreateDateColumn()
  @Field((type) => Date)
  updatedAt: Date;
}
