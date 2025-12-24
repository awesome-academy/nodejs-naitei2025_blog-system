import { Comment } from "./comment.interface";
import { UserBasic } from "./user.interface";

export interface ArticleListItem {
    title: string;
    slug: string;
    description: string;
    status: "published" | "draft" | "rejected" | "pending";
    cover_image: string;
    created_at: string;
    updated_at: string;
    published_at?: string;
    views: number;
    reading_time: number;
    tagList: string[];
    comments_count: number;
    author: UserBasic;
    favorites_count: number;
    favorited: boolean;
}

export interface ArticleDetail extends ArticleListItem {
    body: string;
    comments: Comment[];
}