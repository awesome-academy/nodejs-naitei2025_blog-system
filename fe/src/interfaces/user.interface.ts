import { ArticleListItem } from "./article.interface";

export interface UserListItem extends UserBasic {
  email: string;
  bio: string;
  article_count: number;
  follower_count: number;
  following_count: number;
  role: "USER" | "ADMIN";
  created_at: string;
}

export interface CreateUser {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface UserBasic {
  name: string;
  username: string;
  image: string;
}

export interface UserDetail extends UserListItem {
  articles: ArticleListItem[];
  favouritedArticles: ArticleListItem[];
  following: UserBasic[];
  followers: UserBasic[];
}
