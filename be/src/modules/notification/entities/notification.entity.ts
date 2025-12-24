import { BaseEntity } from 'src/common/class/base-entity';
import { ArticleEntity } from 'src/modules/article/entities/article.entity';
import { CommentEntity } from 'src/modules/comment/entities/comment.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum NotificationType {
  FOLLOW = 'FOLLOW',
  NEW_ARTICLE = 'NEW_ARTICLE',
  ARTICLE_FAVORITED = 'ARTICLE_FAVORITED',
  COMMENT = 'COMMENT',
  REPLY = 'REPLY',
}

@Entity({ name: 'notifications' })
export class NotificationEntity extends BaseEntity {
  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column({ default: false })
  is_read: boolean;

  @Column({ nullable: true })
  action_url: string;

  // Người nhận thông báo
  @ManyToOne(() => UserEntity, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipientId' })
  recipient: UserEntity;

  // Người tạo ra hành động (VD: A favorite bài của B -> sender là A)
  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'senderId' })
  sender: UserEntity;

  // Bài viết liên quan (nếu có)
  @ManyToOne(() => ArticleEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'articleId' })
  article: ArticleEntity;

  // Comment liên quan (nếu có)
  @ManyToOne(() => CommentEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment: CommentEntity;
}
