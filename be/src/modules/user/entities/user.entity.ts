import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/class/base-entity';
import { ArticleEntity } from 'src/modules/article/entities/article.entity';
import { NotificationEntity } from 'src/modules/notification/entities/notification.entity';
import {
  AfterLoad,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  VirtualColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({ length: 20, nullable: false })
  name: string;

  @Column({ length: 30, unique: true, nullable: false })
  email: string;

  @Column({ length: 10, unique: true, nullable: false })
  username: string;

  @Column({ length: 200, nullable: false, select: false })
  password: string;

  @Column({ length: 200, default: '' })
  bio: string;

  @Column({ length: 100, default: '' })
  image: string;

  @OneToMany(() => ArticleEntity, (article) => article.author)
  articles: ArticleEntity[];

  // User theo dõi ai (following)
  @ManyToMany(() => UserEntity, (user) => user.followers)
  @JoinTable({
    name: 'user_follows', // ← Tên bảng trung gian
    joinColumn: { name: 'follower_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'following_id', referencedColumnName: 'id' },
  })
  following: UserEntity[];

  // Ai theo dõi user này (followers)
  @ManyToMany(() => UserEntity, (user) => user.following)
  followers: UserEntity[];

  @ManyToMany(() => ArticleEntity, (article) => article.favoritedBy)
  favoritedArticles: ArticleEntity[];

  @Column({ type: 'enum', enum: ['USER', 'ADMIN'], default: 'USER' })
  role: 'USER' | 'ADMIN';

  @Column({ nullable: true, select: false })
  fcm_token: string;

  @OneToMany(() => NotificationEntity, (notification) => notification.recipient)
  notifications: NotificationEntity[];

  @VirtualColumn({
    query: (alias) => {
      return `(SELECT COUNT(*) FROM user_follows uf WHERE uf.follower_id = ${alias}.id)`;
    },
  })
  followingCount: number;

  @VirtualColumn({
    query: (alias) => {
      return `(SELECT COUNT(*) FROM user_follows uf WHERE uf.following_id = ${alias}.id)`;
    },
  })
  followersCount: number;

  @VirtualColumn({
    query: (alias) => {
      return `(SELECT COUNT(*) FROM articles a WHERE a.authorId = ${alias}.id AND a.deleted_at IS NULL)`;
    },
  })
  articlesCount: number;

  declare id: number;

  declare updated_at: Date;

  constructor(partial: Partial<UserEntity>) {
    super();
    Object.assign(this, partial);
  }
}
