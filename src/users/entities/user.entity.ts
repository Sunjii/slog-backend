import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as argon2 from 'argon2';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  @Field((type) => String)
  id: string;

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

  @Column({ default: '' })
  imageLink: string;
}
