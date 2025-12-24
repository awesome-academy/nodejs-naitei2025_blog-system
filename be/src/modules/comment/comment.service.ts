import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CommentEntity } from './entities/comment.entity';
import { ArticleEntity } from '../article/entities/article.entity';
import { UserEntity } from '../user/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetCommentsQueryDto } from './dto/get-comments-query.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
  ) {}

  async createComment(
    slug: string,
    createCommentDto: CreateCommentDto,
    user: UserEntity,
  ): Promise<CommentEntity> {
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException('Bài viết không tồn tại');
    }

    const comment = this.commentRepository.create({
      body: createCommentDto.body,
      depth: 0,
      replyCount: 0,
      author: user,
      article: article,
    });

    const savedComment = await this.commentRepository.save(comment);

    //Tạo Notifications khi có người bình luận bài viết
    if (article.author.id !== user.id) {
      await this.notificationService.createCommentNotification(
        savedComment,
        article,
      );
    }

    // QUAN TRỌNG: Load lại comment để lấy đầy đủ thông tin author và timestamps chính xác
    const fullComment = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['author'],
    });

    if (!fullComment) {
      throw new NotFoundException('Không tìm thấy bình luận vừa tạo');
    }

    return fullComment;
  }

  async createReply(
    commentId: number,
    createCommentDto: CreateCommentDto,
    user: UserEntity,
  ): Promise<CommentEntity> {
    return this.dataSource.transaction(async (manager) => {
      const commentRepo = manager.getRepository(CommentEntity);

      const parentComment = await commentRepo.findOne({
        where: { id: commentId },
        relations: ['author', 'article', 'parentComment'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!parentComment) {
        throw new NotFoundException('Bình luận không tồn tại');
      }

      let newComment: CommentEntity;

      // Logic xử lý độ sâu comment (Max depth = 2)
      if (parentComment.depth < 2) {
        newComment = commentRepo.create({
          body: createCommentDto.body,
          depth: parentComment.depth + 1,
          replyCount: 0,
          author: user,
          article: parentComment.article,
          parentComment: parentComment,
        });

        parentComment.replyCount += 1;
        await commentRepo.save(parentComment);
      } else {
        // Nếu đã quá sâu, gán vào ông nội (Grandparent)
        const grandParent = parentComment.parentComment;

        if (!grandParent) {
          throw new BadRequestException('Không thể tạo reply cho comment này');
        }

        const grandParentComment = await commentRepo.findOne({
          where: { id: grandParent.id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!grandParentComment) {
          throw new NotFoundException('Comment cha không tồn tại');
        }

        newComment = commentRepo.create({
          body: createCommentDto.body,
          depth: 2,
          replyCount: 0,
          author: user,
          article: parentComment.article,
          parentComment: grandParentComment, // Gán parent là ông nội
        });

        grandParentComment.replyCount += 1;
        await commentRepo.save(grandParentComment);
      }

      const savedReply = await commentRepo.save(newComment);

      //Tạo Notifications khi có người reply comment
      if (parentComment.author.id !== user.id) {
        await this.notificationService.createReplyNotification(
          savedReply,
          parentComment,
          parentComment.article,
        );
      }

      // QUAN TRỌNG: Load lại để lấy author và parentComment (để DTO map được parentId)
      const fullReply = await commentRepo.findOne({
        where: { id: savedReply.id },
        relations: ['author', 'parentComment'],
      });

      if (!fullReply) {
        throw new NotFoundException('Không tìm thấy phản hồi vừa tạo');
      }

      return fullReply;
    });
  }

  async getCommentsByArticle(
    slug: string,
    query: GetCommentsQueryDto,
  ): Promise<{
    items: CommentEntity[];
    total: number;
    hasMore: boolean;
    nextCursor: number | null;
  }> {
    const { limit = 10, sort = 'newest', replyLimit = 3, afterId } = query;

    const article = await this.articleRepository.findOne({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Bài viết không tồn tại');
    }

    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.parentComment', 'parentComment')
      .where('comment.articleId = :articleId', { articleId: article.id })
      .andWhere('comment.depth = :depth', { depth: 0 });

    if (afterId) {
      if (sort === 'newest') {
        queryBuilder.andWhere('comment.id < :afterId', { afterId });
      } else {
        queryBuilder.andWhere('comment.id > :afterId', { afterId });
      }
    }

    queryBuilder
      .orderBy('comment.created_at', sort === 'newest' ? 'DESC' : 'ASC')
      .take(limit + 1);

    const rootComments = await queryBuilder.getMany();

    const hasMore = rootComments.length > limit;
    if (hasMore) {
      rootComments.pop();
    }

    for (const comment of rootComments) {
      await this.loadNestedReplies(comment, replyLimit);
    }

    const total = await this.commentRepository.count({
      where: { article: { id: article.id }, depth: 0 },
    });

    const nextCursor =
      hasMore && rootComments.length > 0
        ? rootComments[rootComments.length - 1].id
        : null;

    return {
      items: rootComments,
      total,
      hasMore,
      nextCursor,
    };
  }

  private async loadNestedReplies(
    comment: CommentEntity,
    replyLimit: number,
  ): Promise<void> {
    if (comment.depth >= 2) {
      comment.replies = [];
      return;
    }

    const replies = await this.commentRepository.find({
      where: { parentComment: { id: comment.id } },
      relations: ['author', 'parentComment'],
      order: { created_at: 'ASC' },
      take: replyLimit,
    });

    const totalReplies = comment.replyCount;
    (comment as any).hasMoreReplies = totalReplies > replyLimit;

    comment.replies = replies;

    for (const reply of comment.replies) {
      await this.loadNestedReplies(reply, replyLimit);
    }
  }

  async getReplies(
    commentId: number,
    query: GetCommentsQueryDto,
  ): Promise<{
    items: CommentEntity[];
    total: number;
    hasMore: boolean;
    nextCursor: number | null;
  }> {
    const { limit = 5, afterId, replyLimit = 3 } = query;

    const parentComment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!parentComment) {
      throw new NotFoundException('Comment not found');
    }

    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.parentComment', 'parentComment')
      .where('comment.parentId = :parentId', { parentId: commentId });

    if (afterId) {
      queryBuilder.andWhere('comment.id > :afterId', { afterId });
    }

    queryBuilder.orderBy('comment.created_at', 'ASC').take(limit + 1);

    const replies = await queryBuilder.getMany();

    const hasMore = replies.length > limit;
    if (hasMore) {
      replies.pop();
    }

    for (const reply of replies) {
      if (reply.depth < 2 && reply.replyCount > 0) {
        reply.replies = await this.commentRepository.find({
          where: { parentComment: { id: reply.id } },
          relations: ['author', 'parentComment'],
          order: { created_at: 'ASC' },
          take: replyLimit,
        });
        (reply as any).hasMoreReplies = reply.replyCount > replyLimit;
      } else {
        reply.replies = [];
      }
    }

    const total = parentComment.replyCount;

    const nextCursor =
      hasMore && replies.length > 0 ? replies[replies.length - 1].id : null;

    return {
      items: replies,
      total,
      hasMore,
      nextCursor,
    };
  }

  async updateComment(
    commentId: number,
    updateCommentDto: UpdateCommentDto,
    user: UserEntity,
  ): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Bình luận không tồn tại');
    }

    if (comment.author.id !== user.id) {
      throw new ForbiddenException('Bạn không có quyền sửa bình luận này');
    }

    if (!updateCommentDto.body) {
      throw new BadRequestException('Nội dung bình luận không được để trống');
    }

    comment.body = updateCommentDto.body;

    return this.commentRepository.save(comment);
  }

  async deleteComment(commentId: number, user: UserEntity): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const commentRepo = manager.getRepository(CommentEntity);

      const comment = await commentRepo.findOne({
        where: { id: commentId },
        relations: ['author', 'parentComment'],
      });

      if (!comment) {
        throw new NotFoundException('Bình luận không tồn tại');
      }

      const isAuthor = comment.author.id === user.id;
      const isAdmin = user.role === 'ADMIN';

      if (!isAuthor && !isAdmin) {
        throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
      }

      if (comment.parentComment) {
        const parentComment = await commentRepo.findOne({
          where: { id: comment.parentComment.id },
          lock: { mode: 'pessimistic_write' },
        });

        if (parentComment) {
          parentComment.replyCount = Math.max(0, parentComment.replyCount - 1);
          await commentRepo.save(parentComment);
        }
      }

      await commentRepo.remove(comment);
    });
  }

  async findById(id: number): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'article', 'parentComment'],
    });

    if (!comment) {
      throw new NotFoundException('Bình luận không tồn tại');
    }

    return comment;
  }
}

