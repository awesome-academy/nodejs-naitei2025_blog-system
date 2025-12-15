import { Expose } from 'class-transformer';
import { BaseEntity } from 'src/common/class/base-entity';
import { ArticleEntity } from 'src/modules/article/entities/article.entity';
import { Column, Entity, ManyToMany } from 'typeorm';

@Entity({ name: 'tags' })
export class TagEntity extends BaseEntity {
  @Column({ length: 50, unique: true })
  @Expose()
  name: string;

  @ManyToMany(() => ArticleEntity, (article) => article.tagList)
  articles: ArticleEntity[];
}
