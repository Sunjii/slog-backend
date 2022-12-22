import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ApolloDriver } from '@nestjs/apollo';
import { UserEntity } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { PostModule } from './post/post.module';
import { PostEntity } from './post/entities/post.entity';
import { AuthModule } from './auth/auth.module';
import { CommentEntity } from './post/entities/comment.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'slog',
      entities: [UserEntity, PostEntity, CommentEntity],
      logging: true,
      synchronize: true, // true: 수정된 칼럼, 타입 등등은 테이블을 drop시키고 다시 생성하도록 함
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: true,
      context: ({ req, connection }) => {
        const TOKEN_KEY = 'x-jwt';
        return {
          token: req ? req.headers[TOKEN_KEY] : connection.context[TOKEN_KEY],
        };
      },
    }),
    JwtModule.forRoot({
      privateKey:
        '236979CB6F1AD6B6A6184A31E6BE37DB3818CC36871E26235DD67DCFE4041492',
      //privateKey: process.env.PRIVATE_KEY,
    }),
    PostModule,
    AuthModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
