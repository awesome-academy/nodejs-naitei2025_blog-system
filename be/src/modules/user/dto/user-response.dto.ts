import { Expose, Type } from 'class-transformer';
import { ArticleListItemDto } from 'src/modules/article/dto/article-response.dto';

export class UserBasicDto {
  @Expose()
  name: string;
  @Expose()
  image: string;
  @Expose()
  username: string;
}

export class UserListItemDto extends UserBasicDto {
  @Expose()
  email: string;
  @Expose()
  bio: string;
  @Expose()
  followingCount: number;
  @Expose()
  followersCount: number;
  @Expose()
  articlesCount: number;
  @Expose()
  created_at: Date;
  @Expose()
  role: 'USER' | 'ADMIN';
}

export class UserDetailDto extends UserListItemDto {
  @Expose()
  @Type(() => ArticleListItemDto)
  articles: ArticleListItemDto[];

  @Expose()
  @Type(() => ArticleListItemDto)
  favoritedArticles: ArticleListItemDto[];

  @Expose()
  @Type(() => UserBasicDto)
  following: UserBasicDto[];

  @Expose()
  @Type(() => UserBasicDto)
  followers: UserBasicDto[];
}
