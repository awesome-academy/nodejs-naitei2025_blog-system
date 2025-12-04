import { Exclude, Transform } from 'class-transformer';
import { BaseEntity } from 'src/common/class/base-entity';
import { ArticleStatus } from 'src/common/class/enum/article.enum';
import { CommentEntity } from 'src/modules/comment/entities/comment.entity';
import { TagEntity } from 'src/modules/tag/entities/tag.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'articles' })
export class ArticleEntity extends BaseEntity {
  @Column({ length: 100, unique: true })
  title: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ length: 100 })
  description: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.DRAFT })
  status: ArticleStatus;

  @Column({ nullable: true, length: 200 })
  cover_image: string;

  @Column({ type: 'timestamp', nullable: true })
  published_at?: Date;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  reading_time: number; // in minutes

  @ManyToMany(() => TagEntity, { eager: true })
  @JoinTable()
  @Transform(({ value }) => value.map((tag: TagEntity) => tag.name) as string[])
  tagList: TagEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.article)
  comments: CommentEntity[];

  @ManyToOne(() => UserEntity, (user) => user.articles, {
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;

  @Exclude()
  @ManyToMany(() => UserEntity, (user) => user.favoritedArticles)
  @JoinTable({
    name: 'user_favorite_articles',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  favoritedBy: UserEntity[];

  @Exclude()
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @Exclude()
  declare id: number;
}
