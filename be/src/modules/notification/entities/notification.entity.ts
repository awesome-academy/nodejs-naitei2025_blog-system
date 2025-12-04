import { BaseEntity } from 'src/common/class/base-entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'notifications' })
export class NotificationEntity extends BaseEntity {
  @Column()
  title: string;

  @Column()
  body: string;

  @Column({ default: false })
  is_read: boolean;

  @Column({ nullable: true })
  action_url: string; // Link đến bài viết hoặc user profile liên quan

  // Người nhận thông báo
  @ManyToOne(() => UserEntity, (user) => user.notifications)
  @JoinColumn({ name: 'recipientId' })
  recipient: UserEntity;

  // Người tạo ra hành động (VD: A like bài của B -> sender là A)
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'senderId' })
  sender: UserEntity;
}
