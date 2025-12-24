import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationEntity,
  NotificationType,
} from './entities/notification.entity';
import { UserEntity } from '../user/entities/user.entity';
import { ArticleEntity } from '../article/entities/article.entity';
import { CommentEntity } from '../comment/entities/comment.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createFollowNotification(
    follower: UserEntity,
    following: UserEntity,
  ): Promise<NotificationEntity> {
    const notification = this.notificationRepository.create({
      type: NotificationType.FOLLOW,
      title: 'New Follower',
      body: `${follower.name} started following you`,
      action_url: `/profiles/${follower.username}`,
      recipient: following,
      sender: follower,
    });
    return this.notificationRepository.save(notification);
  }

  async createNewArticleNotifications(article: ArticleEntity): Promise<void> {
    const author = article.author;

    const authorWithFollowers = await this.userRepository.findOne({
      where: { id: author.id },
      relations: ['followers'],
    });

    const followers = authorWithFollowers?.followers || [];

    if (followers.length === 0) return;

    const notifications = followers.map((follower) =>
      this.notificationRepository.create({
        type: NotificationType.NEW_ARTICLE,
        title: 'New Article',
        body: `${author.name} posted a new article: "${article.title}"`,
        action_url: `/articles/${article.slug}`,
        recipient: follower,
        sender: author,
        article: article,
      }),
    );

    await this.notificationRepository.save(notifications);
  }

  async createFavoriteNotification(
    user: UserEntity,
    article: ArticleEntity,
  ): Promise<NotificationEntity> {
    const notification = this.notificationRepository.create({
      type: NotificationType.ARTICLE_FAVORITED,
      title: 'Article Favorited',
      body: `${user.name} favorited your article "${article.title}"`,
      action_url: `/articles/${article.slug}`,
      recipient: article.author,
      sender: user,
      article: article,
    });
    return this.notificationRepository.save(notification);
  }

  async createCommentNotification(
    comment: CommentEntity,
    article: ArticleEntity,
  ): Promise<NotificationEntity> {
    const notification = this.notificationRepository.create({
      type: NotificationType.COMMENT,
      title: 'New Comment',
      body: `${comment.author.name} commented on your article "${article.title}"`,
      action_url: `/articles/${article.slug}#comment-${comment.id}`,
      recipient: article.author,
      sender: comment.author,
      article: article,
      comment: comment,
    });
    return this.notificationRepository.save(notification);
  }

  async createReplyNotification(
    reply: CommentEntity,
    parentComment: CommentEntity,
    article: ArticleEntity,
  ): Promise<NotificationEntity> {
    const notification = this.notificationRepository.create({
      type: NotificationType.REPLY,
      title: 'New Reply',
      body: `${reply.author.name} replied to your comment`,
      action_url: `/articles/${article.slug}#comment-${reply.id}`,
      recipient: parentComment.author,
      sender: reply.author,
      article: article,
      comment: reply,
    });
    return this.notificationRepository.save(notification);
  }


  async getNotifications(userId: number, page = 1, limit = 20) {
    const [notifications, total] = await this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.sender', 'sender')
      .leftJoinAndSelect('notification.article', 'article')
      .leftJoinAndSelect('notification.comment', 'comment')
      .where('notification.recipientId = :userId', { userId })
      .orderBy('notification.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
