import { Expose, Transform, Type } from 'class-transformer';

class AuthorResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  username: string;

  @Expose()
  image: string;
}

export class CommentResponseDto {
  @Expose()
  id: number;

  @Expose()
  body: string;

  @Expose()
  depth: number;

  @Expose()
  replyCount: number;

  @Expose()
  @Type(() => AuthorResponseDto)
  author: AuthorResponseDto;

  @Expose()
  @Transform(({ obj }) => obj.parentComment?.id || null)
  parentId: number | null;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  @Expose()
  @Type(() => CommentResponseDto)
  replies?: CommentResponseDto[];

  @Expose()
  hasMoreReplies?: boolean;
}

export class CommentListResponseDto {
  @Expose()
  @Type(() => CommentResponseDto)
  items: CommentResponseDto[];

  @Expose()
  total: number;

  @Expose()
  hasMore: boolean;

  @Expose()
  nextCursor: number | null;
}
