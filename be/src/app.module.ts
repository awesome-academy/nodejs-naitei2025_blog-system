import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule, JwtModuleAsyncOptions } from '@nestjs/jwt';
import { jwtConfig } from './configs/jwt.config';
import {
  ThrottlerModule,
  ThrottlerModuleOptions,
  ThrottlerGuard,
} from '@nestjs/throttler';
import { ArticleModule } from './modules/article/article.module';
import { AuthMiddleware } from './common/middlewares/auth.middleware';
import { TagModule } from './modules/tag/tag.module';
import { CommentModule } from './modules/comment/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        return typeORMConfig(configService);
      }, //useFactory dùng để gọi hàm
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService): JwtModuleAsyncOptions =>
        jwtConfig(configService),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            name: 'login',
            ttl: configService.get<number>('THROTTLE_TTL') as number,
            limit: configService.get<number>('THROTTLE_LIMIT') as number,
          },
        ],
      }),
    }),
    UserModule,
    AuthModule,
    ArticleModule,
    TagModule,
    CommentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
